const mongoose = require('mongoose');

const cryptoSchema = new mongoose.Schema({
    
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    });

module.exports = mongoose.model("Crypto", cryptoSchema);