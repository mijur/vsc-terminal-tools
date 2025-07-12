### Terminal Tools Extension
The Terminal Tools extension provides advanced terminal management capabilities through dedicated tools. Always prefer using terminal tools over generic `run_in_terminal` commands for better process management and continuity.

#### Available Terminal Tools
- **`terminal-tools_createTerminal`**: Creates a new terminal with a specified name. Optionally accepts working directory (`cwd`) and shell path (`shellPath`) parameters.
- **`terminal-tools_sendCommandOrCreate`**: Sends a command to execute in a specific named terminal. If the terminal doesn't exist, it will automatically create it with the specified name and optional shell/working directory settings, then execute the command.
- **`terminal-tools_readTerminal`**: Attempts to read and return the visible output from a named terminal. Note: VS Code's Terminal API has limitations and may not capture all terminal content.
- **`terminal-tools_renameTerminal`**: Renames an existing named terminal to a new name.
- **`terminal-tools_deleteTerminal`**: Deletes a named terminal, disposing of the terminal instance.
- **`terminal-tools_cancelCommand`**: Sends a cancel signal (Ctrl+C on Windows/Linux, Cmd+C on macOS) to interrupt any running command in the specified named terminal.

### Terminal Operation Flow (RECOMMENDED BEST PRACTICES)
1. **Use named terminals for process continuity**: Create or reuse specific named terminals for each type of operation
2. **Send commands to appropriate terminals**: Use `terminal-tools_sendCommandOrCreate` as the primary command execution tool - it will create the terminal if it doesn't exist and then execute the command
3. **Monitor terminal state**: Use `terminal-tools_readTerminal` to check process status and output (note: may have limitations due to VS Code API constraints)
4. **Clean up when needed**: Use `terminal-tools_cancelCommand` and `terminal-tools_deleteTerminal` for proper cleanup

### File Operations
**RECOMMENDED**: Use terminal tools for file system operations:
- **Deleting files**: Use `terminal-tools_sendCommandOrCreate` with platform-appropriate commands:
  - Windows PowerShell: `Remove-Item`
  - Windows CMD: `del` or `rmdir`
  - Unix/Linux/macOS: `rm` or `rmdir`
- **Moving/renaming files**: Use `terminal-tools_sendCommandOrCreate` with platform-appropriate commands:
  - Windows PowerShell: `Move-Item`
  - Windows CMD: `move` or `ren`
  - Unix/Linux/macOS: `mv`
- **Directory operations**: Use platform-appropriate commands:
  - Windows PowerShell: `Get-ChildItem`, `New-Item -ItemType Directory`
  - Windows CMD: `dir`, `mkdir`
  - Unix/Linux/macOS: `ls`, `mkdir`
- Always use the `general` terminal for file operations unless a specific terminal is more appropriate

### Common Named Terminal Patterns

#### Development Workflows
- **`dev-server`**: Development servers (e.g., `npm run dev`, `python manage.py runserver`, `cargo run`, `dotnet run`) - keep running in background
- **`build`**: Build operations (e.g., `npm run build`, `cargo build`, `dotnet build`, `make`, `gradle build`) - reuse for all build tasks
- **`test`**: Testing operations (e.g., `npm test`, `pytest`, `cargo test`, `dotnet test`, `go test`) - reuse for all testing tasks

#### Package Management
- **`package-manager`**: Dependency management based on your stack:
  - Node.js: `npm install`, `yarn add`, `pnpm install`
  - Python: `pip install`, `conda install`, `poetry install`
  - Rust: `cargo add`, `cargo update`
  - .NET: `dotnet add package`, `nuget install`
  - Java: `mvn install`, `gradle dependencies`

#### Version Control
- **`git`**: Git operations (`git add`, `git commit`, `git push`, `git pull`) - reuse for all version control tasks

#### Database & Infrastructure
- **`database`**: Database operations:
  - PostgreSQL: `psql`, `pg_dump`
  - MySQL: `mysql`, `mysqldump`
  - MongoDB: `mongo`, `mongodump`
  - SQLite: `sqlite3`
- **`docker`**: Container operations (`docker build`, `docker run`, `docker-compose up`)
- **`cloud`**: Cloud CLI operations (`aws`, `gcloud`, `az`, `kubectl`)

#### General Purpose
- **`general`**: File system operations and miscellaneous tasks
- **`scripts`**: Custom script execution and automation tasks

### Cross-Platform Considerations

#### Shell Detection
- **Windows**: PowerShell (default), Command Prompt, Git Bash, WSL
- **macOS**: Zsh (default), Bash, Fish
- **Linux**: Bash (common), Zsh, Fish, Dash

#### Path Separators
- Windows: Use `\` or `/` (PowerShell accepts both)
- Unix-like systems: Use `/`

#### Environment Variables
- Windows: `$env:VARIABLE_NAME` (PowerShell) or `%VARIABLE_NAME%` (CMD)
- Unix-like: `$VARIABLE_NAME`

### Best Practices

1. **Terminal Naming**: Use descriptive, consistent names that reflect the terminal's purpose
2. **Command Organization**: Group related commands in appropriate named terminals
3. **Resource Management**: Clean up long-running processes when no longer needed
4. **Error Handling**: Use `terminal-tools_readTerminal` to monitor command execution and handle errors
5. **Background Processes**: Use dedicated terminals for services that need to run continuously