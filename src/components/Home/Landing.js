import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Landing.css';

function Landing() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'text/csv'];
            if (validTypes.includes(file.type)) {
                setSelectedFile(file);
                setUploadStatus('');
            } else {
                setUploadStatus('Unsupported file type. Please upload PDF, PPT, or CSV files.');
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${process.env.REACT_APP_FAST_API}/upload-document/`, {
                method: 'POST',
                body: formData,
                credentials: 'include', 
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            setUploadStatus(result.message);

            window.location.reload();
            navigate('/document-chat', { state: { fileContent: result.fileContent } });
            setSelectedFile(null); 
        } catch (error) {
            setUploadStatus('Upload failed. Please try again.');
            console.error(error); 
        }
    };

    return (
        <div className="landing-container">
            <main className="main-content">
                <h1>Upload Document</h1>
                <div className='drop-background'>
                    <div className="dropbox-container">
                        <input type="file" onChange={handleFileChange} />
                        <button onClick={handleUpload}>Upload</button>
                        {uploadStatus && <p>{uploadStatus}</p>}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Landing;
