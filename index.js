const cheerio = require('cheerio');
const axios = require('axios');

async function fetchAndParseDoc() {
    const url = 'https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub';
    try {
        const response = await axios.get(url);
        const html = response.data;

        // Load the HTML into cheerio
        const $ = cheerio.load(html);

        // Extract the relevant table or content
        const tableData = [];
        $('table tr').each((rowIndex, row) => {
            const rowData = [];
            $(row).find('td').each((colIndex, cell) => {
                rowData.push($(cell).text().trim());
            });
            tableData.push(rowData);
        });

        // Transform the table data into an array of objects
        const transformedData = tableData
            .slice(1) // Skip the header row
            .map(row => ({
                x: parseInt(row[0], 10),
                char: row[1],
                y: parseInt(row[2], 10),
            }));

        return transformedData;
    } catch (error) {
        console.error('Error fetching or parsing document:', error.message);
    }
}

function createGrid(data) {
    // Determine grid dimensions
    const maxX = Math.max(...data.map(d => d.x));
    const maxY = Math.max(...data.map(d => d.y));

    // Initialize a 2D array filled with spaces
    const grid = Array(maxY + 1)
        .fill(null)
        .map(() => Array(maxX + 1).fill(' '));

    // Populate the grid with characters
    data.forEach(({ x, char, y }) => {
        grid[y][x] = char;
    });

    return grid;
}

function displayGrid(grid) {
    // Display the grid row by row
    grid.forEach(row => console.log(row.join('')));
}

// Main function
(async function main() {
    const data = await fetchAndParseDoc();
    if (data) {
        const grid = createGrid(data);
        displayGrid(grid);
    }
})();
