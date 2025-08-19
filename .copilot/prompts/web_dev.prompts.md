# Custom Prompts for GitHub Copilot

## Development Workflow Prompts

### Code Generation Prompts

#### Function Creation
```
Create a [function/method] that [description] with the following requirements:
- Input parameters: [list parameters]
- Return value: [describe return]
- Error handling: [specify error cases]
- Performance considerations: [any specific requirements]
- Browser compatibility: [target browsers]
```

#### Component Development
```
Build a [component type] component that:
- Renders [visual description]
- Handles [user interactions]
- Manages [state requirements]
- Follows accessibility best practices
- Is responsive for mobile and desktop
- Includes proper error boundaries
```

#### API Integration
```
Implement an API integration for [service/endpoint] that:
- Handles authentication: [auth method]
- Manages rate limiting and retries
- Includes proper error handling
- Caches responses appropriately
- Provides loading and error states
- Is testable and mockable
```

### Debugging Prompts

#### Bug Investigation
```
Help debug this issue: [describe problem]
Current behavior: [what's happening]
Expected behavior: [what should happen]
Code context: [relevant code snippet]
Browser/environment: [testing environment]
Error messages: [any console errors]
```

#### Performance Optimization
```
Optimize this code for better performance:
[code snippet]
Current issues: [performance problems]
Target metrics: [specific goals]
Constraints: [any limitations]
Profiling data: [if available]
```

### Code Review Prompts

#### Quality Review
```
Review this code for:
- Code quality and maintainability
- Performance implications
- Security vulnerabilities
- Accessibility compliance
- Browser compatibility
- Best practice adherence

[code to review]
```

#### Architecture Review
```
Evaluate this architectural approach:
[description of architecture]
Requirements: [functional requirements]
Constraints: [technical constraints]
Scalability needs: [future considerations]
Team context: [team size/experience]
```

### Game Development Specific Prompts

#### Game Mechanics
```
Implement a game mechanic for [mechanic description]:
- Player interactions: [how players interact]
- Game state changes: [what changes]
- Visual feedback: [animations/effects]
- Audio cues: [sound requirements]
- Performance targets: [60fps, etc.]
- Mobile considerations: [touch controls]
```

#### Game Engine Integration
```
Integrate [feature] with the game engine:
- Engine: [Phaser/Three.js/Canvas/etc.]
- Integration points: [where it connects]
- Data flow: [how data moves]
- Event handling: [what events to handle]
- Rendering considerations: [visual requirements]
- Memory management: [cleanup requirements]
```

### Testing Prompts

#### Unit Test Creation
```
Create unit tests for [function/component]:
- Test cases: [specific scenarios]
- Edge cases: [boundary conditions]
- Mock requirements: [external dependencies]
- Assertion types: [what to verify]
- Coverage goals: [percentage targets]
```

#### Integration Testing
```
Design integration tests for [system/feature]:
- User workflows: [end-to-end scenarios]
- API interactions: [external services]
- Database operations: [data persistence]
- UI interactions: [user interface testing]
- Performance benchmarks: [timing requirements]
```

### Documentation Prompts

#### API Documentation
```
Document this API endpoint:
[endpoint details]
Include: authentication, parameters, responses, examples, error codes, rate limits
Format: [OpenAPI/JSDoc/Markdown]
Audience: [developers/end-users]
```

#### User Guide Creation
```
Create user documentation for [feature]:
- Target audience: [user type/skill level]
- Use cases: [common scenarios]
- Step-by-step instructions
- Screenshots/examples
- Troubleshooting section
- FAQ items
```

### Deployment Prompts

#### Build Optimization
```
Optimize the build process for:
- Bundle size reduction
- Loading performance
- Cache optimization
- Asset compression
- Tree shaking configuration
- Code splitting strategy
```

#### Environment Setup
```
Set up [environment type] environment:
- Dependencies: [required packages]
- Configuration: [environment variables]
- Security settings: [access controls]
- Monitoring: [logging/metrics]
- Backup strategies: [data protection]
```

## Usage Instructions

1. **Choose the appropriate prompt** based on your current task
2. **Fill in the bracketed placeholders** with your specific requirements
3. **Add any additional context** that might be relevant
4. **Specify the chatmode** if you want specialized assistance (@web_dev, @game_dev, @debug, @code_review)

## Examples

### Example 1: Function Creation
```
@web_dev Create a function that validates user input with the following requirements:
- Input parameters: email string, password string
- Return value: object with isValid boolean and errors array
- Error handling: invalid email format, weak password
- Performance considerations: should run in under 1ms
- Browser compatibility: IE11+
```

### Example 2: Game Mechanic
```
@game_dev Implement a game mechanic for player movement:
- Player interactions: WASD keys and touch swipe
- Game state changes: position updates, collision detection
- Visual feedback: smooth movement animations
- Audio cues: footstep sounds
- Performance targets: 60fps
- Mobile considerations: touch controls with virtual joystick
```
