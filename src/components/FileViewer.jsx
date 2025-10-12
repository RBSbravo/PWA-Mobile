import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const FileViewer = ({ open, onClose, file, token }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');

  useEffect(() => {
    if (open && file) {
      setError('');
      setFileUrl('');
      setFileType('');
      
      // Determine file type
      const fileName = file.file_name || file.name || '';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
        setFileType('image');
      } else if (extension === 'pdf') {
        setFileType('pdf');
      } else if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(extension)) {
        setFileType('document');
      } else {
        setFileType('other');
      }

      // Set file URL
      const url = file.url || `${import.meta.env.VITE_API_URL}/files/${file.id}/download`;
      setFileUrl(url);
    }
  }, [open, file]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.file_name || file.name || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError('Failed to download file: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const renderFileContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={fileUrl}
              alt={file.file_name || file.name}
              style={{
                maxWidth: '100%',
                maxHeight: isMobile ? '60vh' : '70vh',
                objectFit: 'contain',
                borderRadius: theme.shape.borderRadius,
              }}
              onError={() => setError('Failed to load image')}
            />
          </Box>
        );

      case 'pdf':
        return (
          <Box sx={{ height: isMobile ? '60vh' : '70vh' }}>
            <iframe
              src={fileUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: theme.shape.borderRadius,
              }}
              title={file.file_name || file.name}
              onError={() => setError('Failed to load PDF')}
            />
          </Box>
        );

      case 'document':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DocumentIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Document Preview Not Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This document type cannot be previewed in the browser. Please download it to view.
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? 'Downloading...' : 'Download Document'}
            </Button>
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DescriptionIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              File Preview Not Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This file type cannot be previewed. You can download it to view.
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? 'Downloading...' : 'Download File'}
            </Button>
          </Box>
        );
    }
  };

  if (!file) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          borderRadius: isMobile ? 0 : theme.shape.borderRadius * 2,
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {fileType === 'image' && <ImageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />}
          {fileType === 'pdf' && <PdfIcon sx={{ mr: 1, color: theme.palette.error.main }} />}
          {fileType === 'document' && <DocumentIcon sx={{ mr: 1, color: theme.palette.info.main }} />}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {file.file_name || file.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} disabled={loading} size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open in new tab">
            <IconButton onClick={handleOpenInNewTab} size="small">
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        {renderFileContent()}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button 
          onClick={handleDownload} 
          variant="contained" 
          startIcon={<DownloadIcon />}
          disabled={loading}
        >
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileViewer;
