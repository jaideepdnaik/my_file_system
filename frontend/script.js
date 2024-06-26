function deleteFile(filePath) {
    console.log('Attempting to delete:', filePath);
    fetch('/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: filePath })
    })
    .then(response => {
        console.log('Response from delete request:', response);
        if (response.ok) {
            window.location.reload();
        } else {
            response.text().then(text => {
                alert('Failed to delete file: ' + text);
            });
        }
    })
    .catch(error => {
        console.error('Error during fetch:', error);
        alert('Error during delete operation');
    });
}