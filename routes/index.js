const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();
const clientModel = require("../models/clientModel");
const { responses, slotValidator } = require("../responses");
const { messageBarber, messageClient } = require("../messages");

var response = "";
const credentials = {
  apiKey: process.env.API_KEY,
  username: process.env.USER_NAME,
};
const AfricasTalking = require("africastalking")(credentials);
//message to the client
const sendClientMessage = (phone_number, message, response) => {
  AfricasTalking.SMS.send({
    to: phone_number,
    message: message,

    from: "8411",
  })
    .then((result) => {})
    .catch((error) => {
      response = responses.network_error;
    });
};
//message sent to the barber
const sendBarberMessage = (message, response) => {
  AfricasTalking.SMS.send({
    to: "+254706338454",
    message: message,
    from: "8411",
  })
    .then((result) => {})
    .catch((error) => {
      response = responses.network_error;
    });
};

router.post("/book-barber", (req, res) => {
  let { sessionId, serviceCode, phoneNumber, text } = req.body;
  let textArray = text.split("*");
  var currentDate = new Date().toISOString().slice(0, 10);
  // home menu
  if (textArray[0] === "") {
    response = responses.home_menu;
  }
  //booking appointment
  if (textArray[0] == "1") {
    clientModel
      .find({ phone_number: phoneNumber })
      .then((result) => {
        if (result.length > 0) {
          response = responses.booked;
        }

        if (result.length == 0) {
          if (parseInt(textArray[0]) == 1) {
            response = responses.client_input_data;
          }
          if (textArray.length > 1) {
            let data = textArray[1];
            let client_data = data.split("#");
            let client_book_time = client_data[2];
            let client_book_time_string = client_book_time.toLowerCase();
            let isValid = slotValidator(client_book_time_string);
            if (isValid) {
              if (Date.parse(client_data[1]) < Date.parse(currentDate)) {
                response = responses.future_date;
              }

              if (Date.parse(client_data[1]) >= Date.parse(currentDate)) {
                //db check if slot booked

                clientModel
                  .find({
                    book_date: client_data[1],
                    book_time: client_data[2],
                  })
                  .then((result) => {
                    if (result.length > 0) {
                      response = responses.unavailable_slot;
                    }
                    if (result.length == 0) {
                      let client = new clientModel({
                        client_name: client_data[0],
                        phone_number: phoneNumber,
                        book_date: client_data[1],
                        book_time: client_data[2],
                      });

                      if (client_data.length == 3) {
                        client
                          .save()
                          .then((result) => {
                            let resultArray = Object.keys(result);

                            let {
                              client_name,
                              phone_number,
                              book_date,
                              book_time,
                            } = result;
                            let barberMessage = `
                         Reservation Alert.
                        ${messageBarber(
                          client_name,
                          phone_number,
                          book_date,
                          book_time
                        )}`;
                            let clientMessage = `
Dear ${client_name},thank you for contacting us.Reservation Details are:
${messageClient(client_name, book_date, book_time)}
Dial *384*27742# to check your status.

`;

                            if (resultArray.length > 0) {
                              sendClientMessage(
                                phoneNumber,
                                clientMessage,
                                response
                              );
                              sendBarberMessage(barberMessage, response);

                              response = responses.booking_success;
                            }
                          })
                          .catch((error) => {
                            response = responses.network_error;
                          });
                      }
                    }
                  })
                  .catch((error) => (response = responses.network_error));
              }
            }
            if (isValid==undefined) {
              response = responses.invalid_time_format;
            }
          }
        }
      })
      .catch((error) => (response = responses.network_error));
  }
  //check status
  if (textArray[0] == "3") {
    clientModel
      .find({ phone_number: phoneNumber })
      .then((result) => {
        if (result.length > 0) {
          response = ` END Status:Booked.
         Name:${result[0].client_name}
         Phone Number:${result[0].phone_number}
         Date:${result[0].book_date} 
         Time:${result[0].book_time}`;
        }
        if (result.length == 0) {
          response = responses.not_booked;
        }
      })
      .catch((error) => (response = responses.network_error));
  }
  //Cancel appointment
  if (textArray[0] == "4") {
    clientModel
      .find({ phone_number: phoneNumber })
      .then((result) => {
        if (result.length == 0) {
          response = responses.no_records;
        }
        if (result.length > 0) {
          response = `CON Cancel appointment?
          1.Continue
          2.Cancel`;

          if (textArray[1] == "1") {
            clientModel
              .findOneAndDelete({ phone_number: phoneNumber })
              .then((result) => {
                let resultArray = Object.keys(result);

                let { client_name, phone_number, book_date, book_time } =
                  result;
                let barberMessage = `
Appointment Cancellation.
${messageBarber(client_name, phone_number, book_date, book_time)}

`;
                let clientMessage = `
Dear ${client_name}, appointment cancelled successfully.
${messageClient(client_name, book_date, book_time)}
Dial *384*27742# to book again.`;

                if (resultArray.length > 0) {
                  sendClientMessage(phoneNumber, clientMessage);
                  sendBarberMessage(barberMessage);

                  response = responses.cancellation_success;
                }
              })
              .catch((error) => (response = responses.network_error));
          }

          if (textArray[1] == "2") {
            response = responses.home_menu;
          }
        }
      })
      .catch((error) => (response = responses.network_error));
  }
  //change appointment
  if (textArray[0] == "2") {
    clientModel
      .find({ phone_number: phoneNumber })
      .then((result) => {
        if (result.length == 0) {
          response = responses.no_records;
        }
        if (result.length == 1) {
        response =  ` CON -------Current appointment-------:
          Name:${result[0].client_name}
          Phone Number:${result[0].phone_number}
          Date:${result[0].book_date} 
          Time:${result[0].book_time}
        ${responses.update_client_input_data}
          
          `;
        }
        if (textArray.length == 2) {
          let client_update_data = textArray[1];
          let client_data = client_update_data.split("#");
          let time_text = client_data[2].toLowerCase();
          let isValid = slotValidator(time_text);

          if (isValid) {
            if (Date.parse(client_data[1]) < Date.parse(currentDate)) {
              response = responses.future_date;
            }

            if (Date.parse(client_data[1]) >= Date.parse(currentDate)) {
              clientModel
                .find({ book_date: client_data[1], book_time: client_data[2] })
                .then((result) => {
                  if (result.length > 0) {
                    response = responses.unavailable_slot;
                  }
                  if (result.length == 0) {
                    let query = {
                      phone_number: phoneNumber,
                    };

                    clientModel
                      .findOneAndUpdate(
                        query,
                        {
                          client_name: client_data[0],
                          book_date: client_data[1],
                          book_time: client_data[2],
                        },
                        { new: true }
                      )
                      .then((result) => {
                        let resultArray = Object.keys(result);

                        let {
                          client_name,
                          phone_number,
                          book_date,
                          book_time,
                        } = result;
                        let barberMessage = `
  Update on Reservation.
  ${messageBarber(client_name, phone_number, book_date, book_time)}
  `;
                        let clientMessage = `
  Dear ${client_name},we have updated your reservation. Details are as follows:
  ${messageClient(client_name, book_date, book_time)}
   Dial *384*27742# to check your status.
  
  `;
                        if (resultArray.length > 0) {
                          sendClientMessage(
                            phoneNumber,
                            clientMessage,
                            response
                          );
                          sendBarberMessage(barberMessage, response);

                          response = responses.update_success;
                        }
                      })
                      .catch((error) => {
                        response = responses.network_error;
                      });
                  }
                })
                .catch((error) => (response = responses.network_error));
            }
          }
          if (isValid==undefined) {
            response = responses.invalid_time_format;
          }
        }
      })
      .catch((error) => (response = responses.network_error));
  }
  //stk push

  if(textArray[0]==='5'){
response=responses.service_404
  }

  setTimeout(() => {
    res.set("Content-Type: text/plain");
    res.send(response);
  }, 2000);

});

module.exports = router;
