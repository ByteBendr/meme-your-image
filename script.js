let img = new Image();
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let originalImageData;

document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // Update the label with the file name
        const label = document.querySelector('.custom-file-label');
        label.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(e) {
            img.onload = function() {
                const maxWidth = 400;
                const maxHeight = 400;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight / height) * width;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Store the original image data for reprocessing
                originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Update the image with the current burn intensity
                applyBurnEffect();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Event listener for radio button changes
document.querySelectorAll('input[name="burn-intensity"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (originalImageData) {
            applyBurnEffect();
        }
    });
});

function applyBurnEffect() {
    const burnIntensity = document.querySelector('input[name="burn-intensity"]:checked').value;
    let contrastFactor, noiseRange, tintRed, tintGreen, tintBlue;

    switch (burnIntensity) {
        case 'mild':
            contrastFactor = 1.5;
            noiseRange = 50;
            tintRed = 0;
            tintGreen = 0;
            tintBlue = 0;
            break;
        case 'hard':
            contrastFactor = 2.5;
            noiseRange = 100;
            tintRed = 30;
            tintGreen = 0;
            tintBlue = 0;
            break;
        case 'hardcore':
            contrastFactor = 3.5;
            noiseRange = 150;
            tintRed = 80;
            tintGreen = 0;
            tintBlue = 0;
            break;
    }

    // Reapply the burn effect from scratch
    ctx.putImageData(originalImageData, 0, 0);
    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Convert to grayscale
        let grayscale = 0.3 * r + 0.59 * g + 0.11 * b;

        // Apply contrast
        r = Math.min(255, grayscale * contrastFactor + tintRed);
        g = Math.min(255, grayscale * contrastFactor * 0.7 + tintGreen);
        b = Math.min(255, grayscale * contrastFactor * 0.5 + tintBlue);

        // Add noise
        const noise = (Math.random() - 0.5) * noiseRange;
        r = Math.min(255, r + noise);
        g = Math.min(255, g + noise);
        b = Math.min(255, b + noise);

        // Set the new pixel values
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255; // Alpha channel
    }

    ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0);

    // Show the download button
    const downloadButton = document.getElementById('download');
    downloadButton.style.display = 'inline-block';
    downloadButton.href = canvas.toDataURL('image/png');
    downloadButton.download = 'burned-image.png';
}
