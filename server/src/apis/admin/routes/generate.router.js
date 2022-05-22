const fakeData = require('../../../utils/faker');
const router = require('express').Router();

router.get('/user', async (req, res) => {
    let { numberOfUsers, numberOfPosts } = req.query;
    await fakeData.createUserAndPost(numberOfUsers, numberOfPosts);
    console.log('Done');
    res.send('Done');
});

router.get('/clear', async (req, res) => {
    await fakeData.clearAllData();
    console.log('Done');
    res.send('Done');
});

module.exports = router;
