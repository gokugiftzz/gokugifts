/**
 * Handles extraction of Image URL from either the old format (string)
 * or the new professional format (object with url and imgId).
 * Also replaces unreliable placeholder domains.
 */
export const getImageUrl = (imageInput) => {
  if (!imageInput) return 'https://placehold.co/400x400/f3f4f6/374151?text=Gift';
  
  let url = '';
  if (typeof imageInput === 'string') {
    url = imageInput;
  } else if (typeof imageInput === 'object' && imageInput.url) {
    url = imageInput.url;
  }

  // Handle problematic placeholder domains
  if (url.includes('via.placeholder.com')) {
    return url.replace('via.placeholder.com', 'placehold.co');
  }

  return url || 'https://placehold.co/400x400/f3f4f6/374151?text=Gift';
};
