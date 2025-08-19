# Custom Instructions for GitHub Copilot

## General Development Guidelines

### Code Quality Standards
- Always write clean, readable, and well-documented code
- Follow consistent naming conventions (camelCase for JavaScript, kebab-case for CSS)
- Include meaningful comments for complex logic
- Use TypeScript when possible for better type safety
- Implement proper error handling and validation

### Project-Specific Context
- This is a web-based game project called "3799Steps"
- Focus on performance optimization for real-time gameplay
- Ensure mobile compatibility and responsive design
- Prioritize user experience and accessibility
- Consider offline functionality where applicable

### Response Preferences
- Provide complete, working code examples
- Include explanations for complex implementations
- Suggest multiple approaches when applicable (beginner vs advanced)
- Always consider security implications
- Include testing strategies and debugging tips

### Technology Stack Preferences
- Vanilla JavaScript over heavy frameworks unless specifically needed
- Modern CSS (Grid, Flexbox, Custom Properties)
- HTML5 semantic elements and ARIA attributes
- Progressive enhancement approach
- Cross-browser compatibility (support IE11+ when specified)

### Performance Considerations
- Optimize for 60fps gameplay
- Minimize bundle size and loading times
- Implement efficient asset loading strategies
- Use requestAnimationFrame for animations
- Consider memory management and garbage collection

### Accessibility Requirements
- Follow WCAG 2.1 AA guidelines
- Implement proper keyboard navigation
- Include screen reader support
- Ensure sufficient color contrast
- Support high contrast and reduced motion preferences

### Security Best Practices
- Validate all user inputs
- Implement proper Content Security Policy
- Use HTTPS for all external resources
- Sanitize data before DOM manipulation
- Follow OWASP guidelines for web security

### Documentation Standards
- Include JSDoc comments for functions and classes
- Provide README documentation for setup and usage
- Document API endpoints and data structures
- Include code examples in documentation
- Maintain changelog for significant updates

### Testing Approach
- Write unit tests for core functionality
- Include integration tests for user interactions
- Implement visual regression testing for UI components
- Test across multiple browsers and devices
- Include performance benchmarks

### Deployment Considerations
- Optimize assets for production (minification, compression)
- Implement proper caching strategies
- Use CDN for static assets when appropriate
- Include monitoring and error tracking
- Ensure graceful degradation for older browsers
