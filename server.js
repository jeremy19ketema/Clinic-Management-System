const http = require('http');
const fs = require('fs');
const url = require('url');

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
            const newClinic = JSON.parse(body);
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
            const updatedClinic = JSON.parse(body);
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
    const clinicDataPath = path.join(__dirname, 'data', 'clinics.json');
    const data = await fs.promises.readFile(clinicDataPath, 'utf-8');
    
    const clinics = JSON.parse(data);
    const newId = clinics.length > 0 ? clinics[clinics.length - 1].id + 1 : 1;
    clinic.id = newId;
    clinics.push(clinic);
    await fs.promises.writeFile(clinicDataPath, JSON.stringify(clinics, null, 2));

    return clinic;
}