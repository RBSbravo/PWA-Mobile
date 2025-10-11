import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

const FileAttachment = ({ onUpload, files = [], onRemove }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileIcon />;
  };

  return (
    <Box sx={{ my: 1.25 }}>
      {/* Attach Files Button */}
      <Button
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={16} /> : <AttachFileIcon />}
        onClick={handleAttachClick}
        disabled={uploading}
        sx={{
          borderRadius: theme.shape.borderRadius * 2,
          textTransform: 'none',
          fontWeight: 500,
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            borderColor: theme.palette.primary.dark,
            backgroundColor: theme.palette.primary.main + '10',
          },
        }}
      >
        {uploading ? 'Uploading...' : 'Attach Files'}
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept="*/*"
      />

      {/* Files List */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Attached Files ({files.length})
          </Typography>
          <List
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius * 2,
              border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            {files.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  borderBottom: index < files.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                <Box sx={{ mr: 1, color: theme.palette.text.secondary }}>
                  {getFileIcon(file.name || file.fileName)}
                </Box>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name || file.fileName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {file.size ? formatFileSize(file.size) : ''}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => onRemove && onRemove(index)}
                    sx={{ color: theme.palette.error.main }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileAttachment;
