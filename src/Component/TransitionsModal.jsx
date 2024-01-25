import * as React from 'react';
import { Typography, Button, Fade, Modal, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { confirmImageUploaded, generateUploadUrl, uploadImage } from '../utils/api'

export default function TransitionsModal({ openTransitionsModal, setOpenTransitionsModal }) {
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [privacy, setPrivacy] = React.useState('public');
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState('');

    const hiddenFileInput = React.useRef(null);

    const handlePrivacyChange = (event) => {
        setPrivacy(event.target.value);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);

             // Create a URL for the file
             const reader = new FileReader();
             reader.onloadend = () => {
                 setImagePreviewUrl(reader.result);
             };
             reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = (event) => {
        hiddenFileInput.current.click();
    };

    const handleUploadImage = async () => {
        if (selectedFile) {
            try {
                const genResponse = await generateUploadUrl(privacy);
                if (!genResponse.success) {
                    // Handle failure here
                    console.error('Image upload failed:', genResponse.detail);
                    return;
                }

                const response = await uploadImage(genResponse.url, selectedFile, genResponse.fields); 
                setOpenTransitionsModal(false);

                if (response.status == 204 || response.status == 200) {
                    // S3 response
                    const confirmResponse = await confirmImageUploaded(genResponse.id);
                    if (!confirmResponse.success) {
                        // Handle failure here
                        console.error('Image upload failed:', confirmResponse.detail);
                        return;
                    }

                    console.log('Image uploaded successfully');

                    window.location.reload();
                    return;
                }
                
                if (data.success) {
                    // Handle successful upload here
                    console.log('Image uploaded successfully:', data.image_id);
                    window.location.reload();
                } else {
                    // Handle failure here
                    console.error('Image upload failed:', data.detail);
                }
            } catch (error) {
                // Handle any errors here
                console.error('There was an error uploading the image:', error);
            }
        }
    };


    return (
        <>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={openTransitionsModal}
                onClose={() => setOpenTransitionsModal(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openTransitionsModal}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 300, // Adjust to your preference
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2, // Instagram modals typically have rounded corners
                        }}
                    >
                        <Typography id="transition-modal-title" variant="h6" textAlign="center" component="h2">
                            New Post
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={hiddenFileInput}
                                onChange={handleFileChange}
                                style={{ display: 'none' }} // Hide the input element
                                accept="image/*" // Accept only image files
                            />
                            <Button
                                variant='outlined'
                                startIcon={<AddAPhotoIcon />}
                                onClick={handleUploadClick}
                                sx={{
                                    width: '100%',
                                    height: 'auto', // Adjust based on your UX
                                    borderColor: 'text.primary',
                                    color: 'text.primary',
                                }}
                            >
                                Upload Photo
                            </Button>

                            {/* Image preview */}
                            {imagePreviewUrl && (
                                <Box
                                    sx={{
                                        width: '100%', // Adjust width as needed
                                        height: 200, // Adjust height as needed
                                        backgroundImage: `url(${imagePreviewUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: '4px', // Optional: if you want rounded corners
                                    }}
                                />
                            )}

                            <FormControl component="fieldset">
                                <FormLabel component="legend">Privacy</FormLabel>
                                <RadioGroup
                                    row
                                    aria-label="privacy"
                                    name="row-radio-buttons-group"
                                    value={privacy}
                                    onChange={handlePrivacyChange}
                                >
                                    <FormControlLabel value="public" control={<Radio />} label="Public" />
                                    <FormControlLabel value="private" control={<Radio />} label="Private" />
                                </RadioGroup>
                            </FormControl>
                            <Button
                                variant='contained'
                                color='primary'
                                sx={{
                                    width: '100%',
                                }}
                                onClick={handleUploadImage}
                            >
                                Share
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}
