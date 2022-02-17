const responses = {
  home_menu: ` CON  Welcome to ExecutiveBarbers.
    
    1.Book Appointment
    2.Change Appointment
    3.Check status
    4.Cancel Appointment
    5.Pay
    
    Helpline:0706338454`,
  booked: `END You are booked.
    check status/change booking Dial *384*27742#`,
  client_input_data: `CON   Provide your name & booking time.
  NB:Time should be 8am-9am,10am-11am etc
  \n
   eg simon#2022-06-20#8am-9am
 
  

`,
  future_date: `END Please provide a date in the future`,
  unavailable_slot: `END Sorry.Slot not available.Dial *384*27742#`,
  booking_success: ` END Booking was successful.Wait for confirmation SMS.`,
  update_success: `END Update was successful.Wait for confirmation SMS.`,
  network_error: `END Error occured.Please try again.`,
  not_booked: `END You are not booked.\nDial *384*27742#`,
  no_records: `END You have no records.Dial *384*27742#`,
  cancellation_success: ` END Cancellation was successful.Wait for confirmation SMS.`,
  update_client_input_data: `CON   Update your appointment.
    NB:Time should be 8am-9am,10am-11am etc
    \n
   eg simon#2022-06-20#8am-9am



`,
invalid_time_format:'END Please provide a valid time format.',
service_404:'END This ervice not available at the moment.'

};

const slotValidator = (User_slot) => {
  let available_slots = {
    slot0: "8am-9am",
    slot1: "9am-10am",
    slot2: "10am-11am",
    slot3: "11am-12pm",
    slot4: "1pm-2pm",
    slot5: "3pm-4pm",
    slot6: "4pm-5pm",
    slot7: "5pm-6pm",
    slot8: "6pm-7pm",
  };

  for (let key in available_slots) {
    if (available_slots.hasOwnProperty(key)) {
      if (User_slot === available_slots[key]) {
        return true;
      }
      else {
        return false;
      }
    }
  }
};

module.exports = { responses, slotValidator };
