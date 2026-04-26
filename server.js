const http = require('http');
const fs = require('fs');
const DATA_FILE = __dirname + '/data.json';

 const server = http.createServer((req, res) => {
    if (req.url === '/api/clinics' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clinics));
    }
      else if (req.url.startsWith('/api/clinics/') && req.method === 'GET') {
        const clinicId = req.url.split('/')[3];
        const clinic = clinics.find(c => c.id === parseInt(clinicId));
        if (clinic) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(clinic));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Clinic Not Found');
        }
    } 
    else if (req.url === '/api/add-clinic' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {

            if(!body) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request: No data provided');
                return;
            }

            let newClinic;
            try {
                newClinic = JSON.parse(body);
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request: Invalid JSON');
                return;
            }
            const addedClinic = await addClinic(newClinic);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(addedClinic));
        });
    } 
     else if (req.url === '/api/update-clinic' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
                if(!body) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request: No data provided');
                return;
            }
            let updatedClinic;
            try {
                updatedClinic = JSON.parse(body);
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Bad Request: Invalid JSON');
                return;
            }
            const result = await updateClinic(updatedClinic);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        });
    }
     else if (req.url.startsWith('/api/delete-clinic/') && req.method === 'DELETE') {
        (async () => {
            const clinicId = req.url.split('/')[3];
            const result = await deleteClinic(parseInt(clinicId));
            if (result) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Clinic Not Found');
            }
        })();
    } 
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});
const addClinic = async (clinic) => {
    const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
    
    const clinics = JSON.parse(data);
    const newId = clinics.length > 0 ? clinics[clinics.length - 1].id + 1 : 1;
    clinic.id = newId;
    clinics.push(clinic);
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(clinics, null, 2));

    return clinic;
}
const updateClinic = async (clinic) => {
    const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
    const clinics = JSON.parse(data);
    const index = clinics.findIndex(c => c.id === clinic.id);
    if (index !== -1) {
        clinics[index] = clinic;
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(clinics, null, 2));
    }
    return clinic;
}
const deleteClinic = async (id) => {
    const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
    const clinics = JSON.parse(data);
    const index = clinics.findIndex(c => c.id === id);
    if (index !== -1) {
        const deletedClinic = clinics.splice(index, 1)[0];
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(clinics, null, 2));
        return deletedClinic;
    }
    return null;
}
let clinics = [];
const loadInitialData = async () => {
    const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
    clinics = JSON.parse(data);
}

const PORT = 3000;
server.listen(PORT, async () => {
    await loadInitialData();
    console.log(`Clinic Management System Server is running on port ${PORT}`);
    console.log(`Ethiopian Clinics API is ready!`);
});