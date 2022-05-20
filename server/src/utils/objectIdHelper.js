const ObjectId = require('mongoose').Types.ObjectId;

module.exports = (function () {
    function isValidObjectId(id) {
        if (ObjectId.isValid(id)) {
            if (new ObjectId(id.toString()).toString() === id.toString()) return true;
        }
        console.log(id, 'is not ObjectId');
        return false;
    }
    return {
        compare(obj1, obj2) {
            if (!isValidObjectId(obj1) || !isValidObjectId(obj2)) return false;
            return obj1.toString() === obj2.toString();
        },
        include(array, value) {
            return array.some(id => this.compare(id, value));
        },
        listString(array) {
            return array.map(id => id.toString());
        },
        compareArray(array1, array2) {
            return this.listString(array1).toString() === this.listString(array2).toString();
        }
    };
})();
