const mongoose = require('mongoose');

async function connect(stringConnection) {
    try {
        await mongoose.connect(stringConnection, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
        console.log('Database connected!');
    } catch {
        console.log('Database connection failed!');
    }
}

module.exports = { connect };
