/**
 * Upload a file to S3 via the server-side API
 * @param {File} file - The file to upload.
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
export const uploadFileToS3 = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/v1/upload', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        const data = await res.json();
        return data.url;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw error;
    }
};
