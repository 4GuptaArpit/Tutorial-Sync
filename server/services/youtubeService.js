const youtubeService = {
  /**
   * Extract video ID from any YouTube URL format.
   * @param {string} url - YouTube video URL
   * @returns {string|null} - Video ID or null
   */
  getVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  },

  /**
   * Fetch video metadata using YouTube's official public oEmbed API.
   * @param {string} url - YouTube URL
   * @returns {Promise<{ title: string, author: string, thumbnail: string, videoId: string }>}
   */
  async getVideoMetadata(url) {
    try {
      const videoId = this.getVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL format');
      }

      // Query YouTube's free public oEmbed endpoint
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        // Fallback metadata if oEmbed fails (e.g. private video)
        return {
          title: `YouTube Tutorial (ID: ${videoId})`,
          author: 'Unknown Creator',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          videoId
        };
      }

      const data = await response.json();
      return {
        title: data.title || 'Untitled Tutorial',
        author: data.author_name || 'YouTube Creator',
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        videoId
      };
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
      // Clean fallback so app does not break
      const videoId = this.getVideoId(url) || 'unknown';
      return {
        title: 'YouTube Programming Tutorial',
        author: 'Content Creator',
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        videoId
      };
    }
  },

  /**
   * Statically parse a video title or description to guess its technology keywords.
   * @param {string} text - Title or description
   * @returns {string[]} - Array of matching technology tags
   */
  extractTechStack(text) {
    if (!text) return [];
    
    const techMap = {
      react: /react(\.js)?/i,
      vue: /vue(\.js)?/i,
      angular: /angular/i,
      nextjs: /next(\.js)?/i,
      svelte: /svelte/i,
      firebase: /firebase/i,
      supabase: /supabase/i,
      mongodb: /mongo(db)?/i,
      express: /express(\.js)?/i,
      nodejs: /node(\.js)?/i,
      redux: /redux/i,
      router: /router/i,
      auth0: /auth0/i,
      clerk: /clerk/i,
      stripe: /stripe/i,
      tailwind: /tailwind(css)?/i,
      typescript: /typescript|ts/i,
      prisma: /prisma/i,
      graphql: /graphql/i,
      apollo: /apollo/i,
      axios: /axios/i,
      bootstrap: /bootstrap/i
    };

    const detected = [];
    for (const [key, regex] of Object.entries(techMap)) {
      if (regex.test(text)) {
        detected.push(key);
      }
    }
    return detected;
  }
};

module.exports = youtubeService;
