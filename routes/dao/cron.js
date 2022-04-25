const datetime = require('node-datetime');
const pool = require('./connectionPool');
const ObjectsToCsv = require('objects-to-csv');
const path = require('path');
const fs = require('fs');
const dt = datetime.create();
var AWS = require('aws-sdk');

const croneObj = {
  getSupscriberDetails: async function (day, type) {
    try {
      return new Promise((resolve, reject) => {
        let query = "CALL spGetaSubscriberList(?,?)";
        let param = [day, type];

        pool.getConnection(async function (err, connection) {
          if (err) { return err.message; }
          connection.query(query, param, async function (err, rows) {
            if (!err) {
              connection.release();
              return resolve(rows[0]);
            }
            else {
              console.log("Crone MYSQLError 2:", err.message || err); connection.release();
              return resolve(err.message);
            }
          });
        });
      });
    }
    catch (Ex) {
      //logger.error("Method Name: Crone Error catch, Error: " + Ex.message || Ex);
      console.log("Crone getSupscriberDetails catch:", Ex.message || Ex);
      return Ex.message;
    }
  },

  updateInvoiceExport: async function (invoiceId) {
    try {

      let query = "CALL spUpdateExportedInvoice(?)";
      let param = [invoiceId];
      pool.getConnection(async function (err, connection) {
        if (err) { console.log("Crone MYSQLError :", err.message || err); }
        connection.query(query, param, async function (err) {
          if (!err) {
            connection.release();
            return 'Success';
          }
          else {
            console.log("Crone MYSQLError 2:", err.message || err);
            connection.release();
          }
        });
      });

    } catch (ex) {
      return ex;
    }
  },
  getInvoiceLineItems: async function (invoiceId, teamId) {
    try {
      var query = "CALL spGetInvoiceLineDetails(?,?)";
      var param = [invoiceId, teamId];
      return await new Promise((resolve) => {
        pool.getConnection(function (err, connection) {
          if (err) {
            console.log("Crone MYSQLError :", err.message || err); return err.message;
          }
          connection.query(query, param, function (error, rows) {
            if (!error) {
              connection.release();
              return resolve(rows[0]);
            }
            else {
              connection.release();
              return resolve(error.message);
            }

          });
        });

      });

    } catch (ex) {
      return ex;
    }
  },
  ApprovedLoopList: async (subscriberData) => {
    try {

      //logger.info("Method Name: croneApprovedList, Input Data: " + JSON.stringify({ emails: subscriberData }));
      console.log("Method Name: croneApprovedList, Input Data: " + JSON.stringify({ emails: subscriberData }));
      return new Promise((resolve) => {
        const element = subscriberData.senderEmail;
        var teamId = subscriberData.teamId;

        var query = "CALL spGetApprovedInvoiceList(?)";
        var param = [teamId];

        pool.getConnection(async function (err, connection) {
          if (err) { console.log("Crone ApprovedLoopList MYSQLError :", err.message || err); return err.message }
          connection.query(query, param, async function (err, rows) {
            if (!err) {
              connection.release();

              if (rows[0]?.length) {

                let invoiceId = [];
                var csvExport = [];
                let len = rows[0].length;
                for (let index = 0; index < len; index++) {
                  var a = { ...rows[0][index] };
                  let data = await croneObj.getInvoiceLineItems(rows[0][index].invoiceId, teamId);
                  a['invoiceLineItems'] = JSON.stringify(data || []);
                  invoiceId.push(rows[0][index].invoiceId);
                  delete a.invoiceId;
                  csvExport.push(a);
                }

                const data = element.split('@');
                const splitEmail = data[1].split('.');
                var domain = splitEmail[0];
                domain = '/' + data[0] + '_' + domain;

                var fileName = domain + '_ApprovedInvoiceList.csv';
                const filePath = path.join(__dirname, `../Files/${fileName}`);
                var formatteddatetime = dt.format('Y-m-d-H-M-S');
                var fileText = [];
                fileText = fileName.split('.');
                fileName = fileText[0].replace(/[^A-Z0-9-_]/gi, '');
                let newfilename = fileName + '_' + formatteddatetime + '.' + fileText[fileText.length - 1];
                const csv = new ObjectsToCsv(csvExport);
                await csv.toDisk(filePath);
                // await uploadObj.uploadToOCI(fileName,undefined);
                await croneObj.CreateS3Directory('Approved_Invoice_List', domain, newfilename, filePath, 'text/csv')
                await new Promise(async (resolve) => {
                  // await objCommon.sendMultiple(null, fs.readFileSync(filePath).toString('base64'));
                  await croneObj.updateInvoiceExport(invoiceId.join(','));
                  return resolve();
                });
              }
              return resolve();
            }
            else {
              console.log("Crone ApprovedLoopList MYSQLError2 :", err.message || err);
              return err.message;
            }
          });
        });

      }).catch(ex => { return ex });
    }
    catch (ex) {
      // logger.error("Method Name: ApprovedLoopList catch, Error: " + ex.message || ex);
      console.log("ApprovedLoopList Catch :", ex.message || ex);
      return ex.message;
    }
  },
  CreateS3Directory: async function createS3Directory(dir, domainName, fileName, filePath, contentType) {
    try {
      //logger.info("Method Name: CreateS3Directory , data: " + JSON.stringify({ dirName: dir, domail: domainName, fileName: fileName, filePath: filePath, contentType: contentType }))
      console.log("Method Name: CreateS3Directory , data: " + JSON.stringify({ dirName: dir, domail: domainName, fileName: fileName, filePath: filePath, contentType: contentType }));
      AWS.config.update({
        accessKeyId: 'AKIA27WJF5N3A6XTCN4J',
        secretAccessKey: '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',
        region: 'us-east-1',
      });
      const fileContent = fs.readFileSync(filePath);

      var s3 = new AWS.S3();
      var params = {
        Key: dir + domainName + '/' + fileName,
        Bucket: 'approvedinvoice-bucket',
        Body: fileContent,
        ContentType: contentType
      };

      return await new Promise((resolve) => {
        s3.putObject(params, function (err, data) {
          if (err) {
            fs.unlinkSync(filePath);
            console.log("S3Upload Error :", err.message || err);
          }
          else {
            fs.unlinkSync(filePath);
            const result = {
              status: 'Success',
              filePath: data.Location,
              message: 'File uploaded successfully'
            };
            return resolve(result)
          };
        });
      })


    }
    catch (ex) {
      return ex;
    }
  },
}

module.exports = croneObj;

