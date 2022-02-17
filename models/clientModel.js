const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    client_name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: Number,
      required: true,
    },
    book_date: {
      type: String,
      required: true,
    },
    book_time: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);

ClientSchema = clientSchema.index(
  { createdOn: 1 },
  { expireAfterSeconds: 86400 * 30 }
);
// drop collection after 30 days

const clientModel = mongoose.model("clients", ClientSchema);

module.exports = clientModel;
