const http = require('http');
const fs = require('fs');
const DATA_FILE = __dirname + '/data.json';

let clinics = [];

async function saveData() {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(clinics, null, 2));
}
async function loadInitialData() {
    try {
        const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
        clinics = JSON.parse(data);
        console.log(`Loaded ${clinics.length} clinics`);
    } catch (err) {
        console.error("Error loading data.json:", err);
        clinics = [];
    }
}

 const server = http.createServer((req, res) => {
    if (req.url === '/api/clinics' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clinics));
        return;
    }
    if (req.url.startsWith('/api/clinics/') && req.method === 'GET') {
        const id = parseInt(req.url.split('/')[3]);
        const clinic = clinics.find(c => c.id === id);
        if (clinic) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(clinic));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Clinic Not Found');
        }
        return;
    } 

    if (req.url === '/api/add-clinic' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);

        req.on('end', async () => {
            try {  
              if(!body) throw new Error('No data provided');
              const newClinic = JSON.parse(body);
              const newId = clinics.length ? Math.max(...clinics.map(c => c.id)) + 1 : 1;
                newClinic.id = newId;
                clinics.push(newClinic);
                await saveData();
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newClinic));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request: No data provided');
            }
        });
        return;
    } 
     if (req.url === '/api/update-clinic' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());

        req.on('end', async () => {
            try {
                if(!body) throw new Error('No data provided');
                const updatedClinic = JSON.parse(body);

                const index = clinics.findIndex(c => c.id === updatedClinic.id);
                if (index == -1) {
                  res.writeHead(404, { 'Content-Type': 'text/plain' });
                  res.end('Bad Request: No data provided');
                  return;
            }
            clinics[index] = { ...clinics[index], ...updatedClinic };
            await saveData();
            
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(clinics[index]));
                return;
            }catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request: Invalid JSON');
            }
        });
        return;
    }
    if (req.url.startsWith('/api/delete-clinic/') && req.method === 'DELETE') {
       (async () => {
            const id = parseInt(req.url.split('/')[3]);
            const index = clinics.findIndex(c => c.id === id);

            if (index == -1) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Clinic Not Found');
                return;
            }
            const deletedClinic = clinics.splice(index, 1)[0];
            await saveData();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(deletedClinic));
        })();
        return;
    } 

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    
});
const PORT = 3000;
server.listen(PORT, async () => {
    await loadInitialData();
    console.log(`Clinic Management System Server is running on port ${PORT}`);
    console.log(`Ethiopian Clinics API is ready!`);
});