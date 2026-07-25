import { toast } from 'react-hot-toast';

/**
 * Triggers a browser file download of the server-generated Markdown export.
 * @param {string} markdownContent - Markdown text
 * @param {string} projectId - Project identifier
 * @param {string} projectTitle - Title for filename
 */
export const downloadMarkdown = (markdownContent, projectId, projectTitle) => {
  try {
    const filename = `tutorialsync-${(projectTitle || 'guide').toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Markdown file exported successfully!');
  } catch (error) {
    console.error('Markdown export failed:', error);
    toast.error('Failed to export Markdown file.');
  }
};

/**
 * Writes text to the clipboard and shows a success toast.
 * @param {string} text - Code or command to copy
 * @param {string} message - Success feedback message
 */
export const copyToClipboard = async (text, message = 'Copied to clipboard!') => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } else {
      // Fallback for non-HTTPS dev environments
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        toast.success(message);
      } else {
        throw new Error('Fallback copy failed');
      }
    }
  } catch (error) {
    console.error('Copy failed:', error);
    toast.error('Failed to copy text.');
  }
};
