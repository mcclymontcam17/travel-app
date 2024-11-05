import Amadeus from 'amadeus';
import promptSync from 'prompt-sync';

const amadeus = new Amadeus({
    clientId: 'cADFo6OnBacKY4UKje4EBIwSr5yr6rmd',
    clientSecret: 'evk3xqFlMVL8xAGz',
});

const prompt = promptSync(); // Create a prompt function

// Function to get airport codes based on destination name
async function getAirportCodes(destinationName) {
    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: destinationName,
            subType: 'AIRPORT'
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching airport codes:", error);
        return [];
    }
}

// Main function to get flight offers
async function fetchFlightOffers() {
    try {
        // Get departure date from user
        const departureDate = prompt('Enter departure date (YYYY-MM-DD): ');

        // Set a default origin location code (assumed as JFK for this example)
        const originLocationCode = 'JFK';

        // Prompt for destination name
        const destinationName = prompt('Enter your destination (e.g., Bahamas): ');

        // Fetch airport codes based on destination name
        const airports = await getAirportCodes(destinationName);

        // Check if any airports were found
        if (airports.length === 0) {
            console.log("No airports found for the specified destination.");
            return;
        }

        // Display available airports
        console.log("Available airports:");
        airports.forEach((airport, index) => {
            console.log(`${index + 1}: ${airport.name} (${airport.iataCode})`);
        });

        // Ask user to select an airport
        let airportIndex;
        while (true) {
            const input = prompt('Select an airport number: ');
            airportIndex = parseInt(input, 10) - 1;

            // Check if input is valid
            if (!isNaN(airportIndex) && airportIndex >= 0 && airportIndex < airports.length) {
                break;
            }
            console.log("Invalid selection. Please enter a valid airport number.");
        }

        const selectedAirportCode = airports[airportIndex].iataCode;

        // Prepare travel info object
        const travelInfo = {
            originLocationCode: originLocationCode,
            destinationLocationCode: selectedAirportCode,
            departureDate: departureDate,
            adults: 1,
            currencyCode: 'USD'
        };

        // Fetch flight offers
        const response = await amadeus.shopping.flightOffersSearch.get(travelInfo);
        console.log("Flight offers in USD retrieved successfully:");
        console.log(response.data);
    } catch (error) {
        if (error.response) {
            console.error("Error Status Code:", error.response.statusCode);
            console.error("Error Details:", error.response.result);
        } else {
            console.error("Unexpected Error:", error);
        }
    }
}

// Call the main function to execute
fetchFlightOffers();
