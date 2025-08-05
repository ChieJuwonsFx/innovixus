export const POST_TEMPLATES = {
  blue: {
    main: '/templates/main-blue.png',
    content: '/templates/content-blue.png',
    textColor: '#FFFFFF', // White text on blue background
    categoryBg: '#2563EB', // Blue background for category (same as theme)
    categoryText: '#FFFFFF', // White text
    borderColor: '#FFFFFF' // White border
  },
  white: {
    main: '/templates/main-white.png',
    content: '/templates/content-white.png',
    textColor: '#100C56', // Dark blue text on white background
    categoryBg: '#100C56', // Blue background for category (same as theme)
    categoryText: '#FFFFFF', // White text
    borderColor: '#100C56' // Blue border
  }
};

export const POST_DIMENSIONS = {
  main: {
    width: 1080,
    height: 1350,
    title: {
      x: 76,
      y: 157,
      maxWidth: 928, 
      font: 'bold 48px Montserrat',
      color: '#FFFFFF',
      lineHeight: 1.2
    },
    category: {
      x: 75,
      y: 289,
      paddingX: 20, 
      paddingY: 6,  
      font: '24px Montserrat',
      lineHeight: 1
    },
    image: {
      x: 58,
      y: 467,
      width: 965,
      height: 665,
      border: 4
    }
  },
  content: {
    width: 1080,
    height: 1350,
    image: {
      maxWidth: 881,
      maxHeight: 1040,
      border: 4
    }
  }
};