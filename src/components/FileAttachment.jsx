import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';

const FileAttachment = ({ onUpload }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    try {
      setUploading(true);
      for (const file of selectedFiles) {
        await onUpload(file);
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ my: 1.25 }}>
      {/* Upload File Button - Matching Image Design */}
            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <AttachFileIcon />}
              onClick={handleAttachClick}
              disabled={uploading}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#66BB6A' : '#2E7D32', // Mobile app primary colors
                color: '#FFFFFF', // White text for better contrast
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                px: 3,
                py: 1.5,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#81C784' : '#1B5E20', // Darker variants on hover
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                },
                '&:disabled': {
                  backgroundColor: theme.palette.mode === 'dark' ? '#4CAF50' : '#A5D6A7',
                  color: theme.palette.mode === 'dark' ? '#C8E6C9' : '#81C784',
                },
              }}
            >
        {uploading ? 'Uploading...' : 'Upload File (PDF & Images Only)'}
      </Button>

      {/* File Type Information */}
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          mt: 1, 
          color: '#666666',
          fontSize: '12px',
          textAlign: 'left'
        }}
      >
        Allowed file types: PDF, JPG, PNG, GIF, WebP, BMP (Max 10MB each)
      </Typography>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp"
      />

    </Box>
  );
};

export default FileAttachment;
