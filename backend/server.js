
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (for DELETE requests)
app.use(express.json());

// Route to serve files and directories
app.get('/files/*', (req, res) => {
    const dirPath = path.join(__dirname, '..', req.params[0]);
    fs.stat(dirPath, (err, stats) => {
        if (err) {
            return res.status(404).send('Not Found');
        }
        if (stats.isDirectory()) {
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    return res.status(500).send('Server Error');
                }
                const fileLinks = files.map(file => {
                    const filePath = path.join(req.params[0], file);
                    return `<li><a href="/files/${filePath}">${file}</a> <button onclick="deleteFile('${filePath}')">Delete</button></li>`;
                }).join('');
                res.send(`<ul>${fileLinks}</ul>
                <script src="../frontend/script.js"></script>`);
            });
        } else {
            res.sendFile(dirPath);
        }
    });
});

// Route to handle file deletion
app.delete('/delete', (req, res) => {
    console.log('Received delete request:', req.body);
    const filePath = path.join(__dirname, '..', req.body.path);
    console.log(`Attempting to delete file: ${filePath}`);

    // Check if file exists before attempting deletion
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return res.status(400).send('File not found');
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
            return res.status(500).send(`Server Error: ${err.message}`);
        }
        console.log(`Successfully deleted file: ${filePath}`);
        res.status(200).send('File Deleted');
    });
});

// Serve the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



// Using promises

/*

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (for DELETE requests)
app.use(express.json());

// Helper function to promisify fs functions
const fsStat = (filePath) => new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
        if (err) return reject(err);
        resolve(stats);
    });
});

const fsReaddir = (dirPath) => new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) return reject(err);
        resolve(files);
    });
});

const fsUnlink = (filePath) => new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
        if (err) return reject(err);
        resolve();
    });
});

// Route to serve files and directories
app.get('/files/*', (req, res) => {
    const dirPath = path.join(__dirname, '..', req.params[0]);

    fsStat(dirPath)
        .then(stats => {
            if (stats.isDirectory()) {
                return fsReaddir(dirPath);
            } else {
                res.sendFile(dirPath);
                throw new Error('File sent, no directory listing needed');
            }
        })
        .then(files => {
            const fileLinks = files.map(file => {
                const filePath = path.join(req.params[0], file);
                return `<li><a href="/files/${filePath}">${file}</a> <button onclick="deleteFile('${filePath}')">Delete</button></li>`;
            }).join('');
            res.send(`<ul>${fileLinks}</ul><script src="../frontend/script.js"></script>`);
        })
        .catch(err => {
            if (err.message !== 'File sent, no directory listing needed') {
                res.status(err.code === 'ENOENT' ? 404 : 500).send(err.message);
            }
        });
});

// Route to handle file deletion
app.delete('/delete', (req, res) => {
    const filePath = path.join(__dirname, '..', req.body.path);

    fsStat(filePath)
        .then(stats => {
            if (stats.isDirectory()) {
                throw new Error('Cannot delete a directory');
            }
            return fsUnlink(filePath);
        })
        .then(() => {
            res.status(200).send('File Deleted');
        })
        .catch(err => {
            if (err.code === 'ENOENT') {
                res.status(400).send('File not found');
            } else {
                res.status(500).send(`Server Error: ${err.message}`);
            }
        });
});

// Serve the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

*/