export default class Validate {
    static coordinate(inputText) {
        const cleanInput = inputText.replace(/[\[\]]/g, '').trim();
        
        // Split the input into latitude and longitude
        let [latitude, longitude] = cleanInput.split(',').map(coord => parseFloat(coord.trim()));

        // Check if both values are valid numbers
        if (!isNaN(latitude) && !isNaN(longitude)) {
            return { latitude, longitude };
        } else {
            throw new Error('Invalid coordinate format');
        }
    }
}