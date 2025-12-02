// src/lib/downloadQR.ts
/**
 * Download QR code image to device
 * @param imageSrc - QR image source URL
 * @param filename - Downloaded file name
 */
export function downloadQRImage(imageSrc: string, filename: string = 'qr-code.jpg') {
    // Create temporary link element
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
