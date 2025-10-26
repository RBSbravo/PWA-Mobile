import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
import { API_CONFIG } from '../config';

const FileViewer = ({ open, onClose, file, token }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [blobUrl, setBlobUrl] = useState('');
  const [isPWAStandalone, setIsPWAStandalone] = useState(false);
  const [displayFallback, setDisplayFallback] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(null);
  const [platform, setPlatform] = useState('unknown');

  // Detect PWA standalone mode for both iOS and Android
  useEffect(() => {
    const isStandalone = 
      // Standard PWA detection
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari PWA detection
      window.navigator.standalone === true ||
      // Android Chrome PWA detection
      document.referrer.includes('android-app://') ||
      // Additional iOS detection methods
      (window.navigator.userAgent.includes('iPhone') && window.navigator.standalone) ||
      (window.navigator.userAgent.includes('iPad') && window.navigator.standalone) ||
      // Additional Android detection methods
      (window.navigator.userAgent.includes('Android') && window.matchMedia('(display-mode: standalone)').matches) ||
      // Check for PWA-specific properties
      (window.screen && window.screen.height === window.innerHeight && window.screen.width === window.innerWidth) ||
      // Check for missing browser UI elements (common in PWA)
      (!window.navigator.userAgent.includes('Chrome') && window.matchMedia('(display-mode: standalone)').matches);
    
    // Detect platform
    let detectedPlatform = 'unknown';
    if (window.navigator.userAgent.includes('iPhone') || window.navigator.userAgent.includes('iPad')) {
      detectedPlatform = 'ios';
    } else if (window.navigator.userAgent.includes('Android')) {
      detectedPlatform = 'android';
    } else if (window.navigator.userAgent.includes('Windows')) {
      detectedPlatform = 'windows';
    } else if (window.navigator.userAgent.includes('Mac')) {
      detectedPlatform = 'mac';
    }
    
    console.log('🔍 PWA Detection:', {
      displayMode: window.matchMedia('(display-mode: standalone)').matches,
      navigatorStandalone: window.navigator.standalone,
      androidAppReferrer: document.referrer.includes('android-app://'),
      userAgent: window.navigator.userAgent,
      platform: detectedPlatform,
      isStandalone
    });
    
    setIsPWAStandalone(isStandalone);
    setPlatform(detectedPlatform);
  }, []);

  useEffect(() => {
    if (open && file) {
      console.log('🔍 FileViewer - File object:', file);
      console.log('🔍 FileViewer - PWA Standalone mode:', isPWAStandalone);
      setError('');
      setFileUrl('');
      setFileType('');
      setBlobUrl('');
      setDisplayFallback(false);
      
      // Clear any existing timeout
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        setLoadTimeout(null);
      }
      
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
      const url = file.url || `${API_CONFIG.BACKEND_API_URL}/files/${file.id}/download`;
      console.log('🔍 FileViewer - Constructed URL:', url);
      setFileUrl(url);
      
      // Load file with authentication
      loadFileWithAuth(url);
    }
  }, [open, file, token, isPWAStandalone]);

  const loadFileWithAuth = async (url) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      setBlobUrl(blobUrl);
      
      // Set a timeout to show fallback if file doesn't display properly
      // Use shorter timeout for mobile PWA modes
      const timeoutDuration = (platform === 'ios' || platform === 'android') ? 2000 : 3000;
      const timeout = setTimeout(() => {
        if (isPWAStandalone && (fileType === 'image' || fileType === 'pdf')) {
          console.warn(`File display timeout in ${platform} PWA standalone mode, showing fallback`);
          setDisplayFallback(true);
        }
      }, timeoutDuration);
      setLoadTimeout(timeout);
      
      console.log('🔍 FileViewer - File loaded successfully, blob URL created');
    } catch (err) {
      console.error('🔍 FileViewer - Error loading file:', err);
      setError(err.message || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup blob URL and timeout when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, [blobUrl, loadTimeout]);

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
    if (blobUrl) {
      // Platform-specific handling for opening files in new tab
      try {
        if (platform === 'ios') {
          // iOS Safari PWA handling
          const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // iOS PWA popup blocked, try alternative method
            const link = document.createElement('a');
            link.href = blobUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else if (platform === 'android') {
          // Android Chrome PWA handling
          const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // Android PWA popup blocked, trigger download
            console.warn('Android PWA popup blocked, triggering download');
            handleDownload();
          }
        } else {
          // Generic handling for other platforms
          const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // Popup blocked or failed, trigger download instead
            handleDownload();
          }
        }
      } catch (error) {
        console.warn('Failed to open in new tab, triggering download:', error);
        handleDownload();
      }
    }
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

    if (!blobUrl) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography color="text.secondary">No file loaded</Typography>
        </Box>
      );
    }

    switch (fileType) {
      case 'image':
        // In PWA standalone mode, images might not display properly
        // Also show fallback for mobile platforms in PWA mode
        if (isPWAStandalone || displayFallback || (platform === 'ios' && isPWAStandalone) || (platform === 'android' && isPWAStandalone)) {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ImageIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Image Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {platform === 'ios' 
                  ? 'In iOS PWA mode, please use "Open in New Tab" or "Download" to view this image.'
                  : platform === 'android'
                  ? 'In Android PWA mode, please use "Open in New Tab" or "Download" to view this image.'
                  : 'In standalone mode, please use "Open in New Tab" or "Download" to view this image.'
                }
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpenInNewTab}
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </Box>
            </Box>
          );
        }
        
        return (
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={blobUrl}
              alt={file.file_name || file.name}
              style={{
                maxWidth: '100%',
                maxHeight: isMobile ? '60vh' : '70vh',
                objectFit: 'contain',
                borderRadius: theme.shape.borderRadius,
              }}
              onError={() => {
                console.warn('Image failed to load, showing fallback UI');
                setDisplayFallback(true);
              }}
            />
          </Box>
        );

      case 'pdf':
        // In PWA standalone mode, PDFs might not display properly in iframe
        // Also show fallback for mobile platforms in PWA mode
        if (isPWAStandalone || displayFallback || (platform === 'ios' && isPWAStandalone) || (platform === 'android' && isPWAStandalone)) {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PdfIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                PDF Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {platform === 'ios' 
                  ? 'In iOS PWA mode, please use "Open in New Tab" or "Download" to view this PDF.'
                  : platform === 'android'
                  ? 'In Android PWA mode, please use "Open in New Tab" or "Download" to view this PDF.'
                  : 'In standalone mode, please use "Open in New Tab" or "Download" to view this PDF.'
                }
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  onClick={handleOpenInNewTab}
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </Box>
            </Box>
          );
        }
        
        return (
          <Box sx={{ height: isMobile ? '60vh' : '70vh' }}>
            <iframe
              src={blobUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: theme.shape.borderRadius,
              }}
              title={file.file_name || file.name}
              onError={() => {
                console.warn('PDF failed to load in iframe, showing fallback UI');
                setDisplayFallback(true);
              }}
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

    </Dialog>
  );
};

export default FileViewer;
