# GitHub Copilot Custom Configuration

This directory contains custom configurations for GitHub Copilot to enhance your development experience for the 3799Steps web game project.

## 📁 Configuration Files

### 🎯 Custom Chat Modes

#### `web_dev.chatmode.md`
- **Purpose**: General web development assistance
- **Focus**: HTML5, CSS3, Modern JavaScript, frameworks, performance, accessibility
- **Usage**: `@web_dev [your question]`
- **Best for**: Frontend development, responsive design, web APIs

#### `game_dev.chatmode.md`
- **Purpose**: Game development specialized assistance
- **Focus**: Canvas/WebGL, game engines, mechanics, physics, performance optimization
- **Usage**: `@game_dev [your question]`
- **Best for**: Game mechanics, graphics, audio, input handling, game optimization

#### `debug.chatmode.md`
- **Purpose**: Debugging and troubleshooting assistance
- **Focus**: Error diagnosis, performance issues, browser compatibility, systematic debugging
- **Usage**: `@debug [your question]`
- **Best for**: Bug fixes, performance problems, error investigation

#### `code_review.chatmode.md`
- **Purpose**: Code review and quality assessment
- **Focus**: Code quality, security, performance, maintainability, best practices
- **Usage**: `@code_review [your code]`
- **Best for**: Code reviews, quality improvements, security audits

### 📋 Custom Instructions

#### `custom_instructions.md`
- **Purpose**: Project-specific development guidelines
- **Contains**: Code quality standards, technology preferences, performance requirements
- **Usage**: Automatically applied to all Copilot interactions
- **Best for**: Consistent project-wide guidance

### 🎪 Custom Prompts

#### `custom_prompts.md`
- **Purpose**: Ready-to-use prompt templates
- **Contains**: Templates for common development tasks
- **Categories**: Code generation, debugging, testing, documentation, deployment
- **Usage**: Copy and customize prompts for specific needs

## 🚀 How to Use

### 1. Activate Chat Modes
```
@web_dev Help me create a responsive navigation menu
@game_dev Implement collision detection for my player character
@debug Why is my game running slowly on mobile devices?
@code_review [paste your code here]
```

### 2. Use Custom Prompts
Copy a prompt template from `custom_prompts.md` and fill in the details:

```
@game_dev Implement a game mechanic for player movement:
- Player interactions: WASD keys and touch swipe
- Game state changes: position updates, collision detection
- Visual feedback: smooth movement animations
- Audio cues: footstep sounds
- Performance targets: 60fps
- Mobile considerations: touch controls with virtual joystick
```

### 3. Combine Modes and Instructions
The custom instructions are automatically applied, so you can focus on your specific question while the context guides the response style and quality.

## 🛠️ Setup Instructions

1. **Ensure VS Code has GitHub Copilot extension installed**
2. **Restart VS Code** to load the new chat modes
3. **Access chat modes** by typing `@` followed by the mode name in Copilot Chat
4. **Use the Command Palette** (`Ctrl+Shift+P`) to run:
   - `Chat: Configure Chat Modes...`
   - `Chat: Configure Instructions...`

## 📚 Quick Reference

| Task | Recommended Mode | Example |
|------|------------------|---------|
| HTML/CSS Issues | `@web_dev` | Layout problems, styling bugs |
| JavaScript Logic | `@web_dev` | Function creation, API integration |
| Game Features | `@game_dev` | Player controls, game mechanics |
| Performance Issues | `@debug` | Slow rendering, memory leaks |
| Code Quality | `@code_review` | Best practices, security review |

## 🎯 Project Context

This configuration is optimized for the **3799Steps** web game project with focus on:
- **Performance**: 60fps gameplay, efficient rendering
- **Compatibility**: Cross-browser support, mobile responsiveness
- **Accessibility**: WCAG compliance, inclusive design
- **Security**: Input validation, secure data handling
- **Maintainability**: Clean code, proper documentation

## 🔄 Updates and Maintenance

- **Review configurations** periodically as the project evolves
- **Update chat modes** when new technologies are adopted
- **Customize prompts** based on recurring development patterns
- **Share improvements** with the team for consistency

## 💡 Tips for Best Results

1. **Be specific** in your questions and provide context
2. **Use the right mode** for your current task
3. **Combine modes** when working on complex features
4. **Reference the custom prompts** for structured requests
5. **Provide code snippets** when asking for reviews or debugging help

---

*Created for the 3799Steps web game project. Enhance your development workflow with intelligent, context-aware assistance.*
