const messageBarber = (client_name, phone_number, book_date, book_time) => {
  const message = `
    Client:${client_name}
    Phone:${phone_number}
    Date:${book_date}
    Time:${book_time}

    `;

  return message;
};
const messageClient = (client_name, book_date, book_time) => {
  const message = `
Reservation Name:${client_name}
Reservation Date:${book_date}
Reservation Time:${book_time}
   `;

  return message;
};

module.exports = { messageBarber, messageClient };
