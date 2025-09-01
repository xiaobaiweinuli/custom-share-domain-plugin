# Custom Share Domain Plugin

A powerful Blinko plugin that allows users to customize share link domains with comprehensive multi-domain management, password protection, and an intuitive sharing interface.

[中文说明](README_zh.md) | English

## ✨ Features

- 🔗 **Multi-Domain Management** - Add and manage multiple custom domains
- 🔐 **Password Protection** - Secure your shared content with 6-digit passwords
- 🎯 **Smart Domain Selection** - Interactive interface to choose sharing domains
- 🏠 **Default Domain Settings** - Set preferred domain for automatic sharing
- 🛡️ **Protocol Intelligence** - Smart HTTPS/HTTP protocol handling
- 📤 **Advanced Share Selector** - Rich UI with domain options and copy functionality
- 💾 **Persistent Storage** - All settings saved locally with state management
- 🔄 **Legacy Migration** - Seamless upgrade from single-domain configurations
- 🌍 **Internationalization** - Full support for Chinese and English
- ❌ **Share Management** - Cancel existing shares with one click

## 🚀 Installation

1. Download the plugin package from releases
2. Upload the plugin in your Blinko admin interface
3. Enable the plugin and configure your domains
4. Start sharing with custom domains!

## 📖 Usage Guide

### Domain Management

1. **Access Settings**: Open the plugin settings panel
2. **Add Domain**: Click "Add Domain" to create a new custom domain
3. **Configure Domain**:
   - Enter a friendly name (e.g., "My Blog")
   - Enter domain URL (protocol optional - HTTPS added automatically)
   - Enable/disable as needed
4. **Set Default**: Choose a default domain for automatic sharing
5. **Save Settings**: Apply your configuration

### Custom Domain Sharing

1. **Right-click** on any note or thought
2. **Select** "Share to Custom Domain" from the context menu
3. **Configure Share Options**:
   - Toggle password protection on/off
   - Enter 6-digit password or generate random one
   - Click "Generate Share Link" to create the share
4. **Choose Domain**: Select from available domains (original + custom)
5. **Copy Link**: Click any domain option to copy the share link
6. **Manage Share**: Use "Cancel Share" to revoke access

### Password Protection

- **6-Digit Interface**: Easy-to-use password input with auto-focus
- **Random Generation**: One-click random password generation
- **State Persistence**: Password settings remembered between sessions
- **Secure Sharing**: Password-protected links for sensitive content

## 🔧 Configuration Options

### Domain Settings
- **Domain Name**: Friendly identifier for your domain
- **Domain URL**: Complete domain address (auto-adds HTTPS if no protocol)
- **Enable Status**: Control domain availability for sharing
- **Default Domain**: Set preferred domain for automatic sharing

### Share Settings
- **Password Protection**: Optional 6-digit password for shared content
- **Share State Management**: Persistent share state across sessions
- **Link Generation**: Official Blinko API integration for secure sharing

### Protocol Handling
- **Smart Detection**: Preserves user-specified HTTP/HTTPS protocols
- **Auto-HTTPS**: Adds HTTPS automatically when no protocol specified
- **Flexible Support**: Works with both HTTP and HTTPS domains

## 🔄 Migration & Compatibility

The plugin provides seamless migration from previous versions:
- **Auto-Detection**: Automatically detects legacy single-domain configs
- **Seamless Upgrade**: Migrates to new multi-domain format without data loss
- **Settings Preservation**: Maintains all user preferences and configurations
- **Backward Compatibility**: Works with existing Blinko installations

## 🌍 Internationalization

Full localization support:
- **简体中文 (zh)** - Complete Chinese interface
- **English (en)** - Full English interface
- **Dynamic Switching** - Follows Blinko's language settings
- **Extensible** - Easy to add more languages

## 🛠️ Technical Details

### Architecture
- **Frontend**: Preact with TypeScript for type safety
- **Build System**: Vite for fast development and optimized builds
- **State Management**: React hooks for component state
- **API Integration**: Official Blinko API for share management
- **Storage**: Blinko's plugin configuration system

### File Structure
```
src/
├── index.tsx           # Main plugin entry point
├── setting.tsx         # Settings panel component
├── share-selector.tsx  # Share selection interface
├── utils.ts           # Utility functions and API calls
├── types.ts           # TypeScript type definitions
└── locales/           # Internationalization files
    ├── en.json        # English translations
    └── zh.json        # Chinese translations
```

### API Integration
- **Share Creation**: `window.Blinko.api.notes.shareNote.mutate()`
- **Share Cancellation**: Cancel existing shares via API
- **Configuration**: `window.Blinko.api.config` for settings persistence
- **Toast Notifications**: `window.Blinko.toast` for user feedback

## 📋 Changelog

### v1.0.0 (Latest)
- ✨ **New**: Multi-domain management system
- ✨ **New**: Password protection with 6-digit interface
- ✨ **New**: Advanced share selector with domain options
- ✨ **New**: Share state persistence and management
- ✨ **New**: Cancel share functionality
- ✨ **New**: Smart protocol handling (HTTP/HTTPS)
- ✨ **New**: Complete internationalization (EN/ZH)
- ✨ **New**: Legacy configuration migration
- 🔧 **Improved**: Domain validation and URL processing
- 🔧 **Improved**: Responsive UI design with overflow handling
- 🔧 **Improved**: Error handling and user feedback
- 🐛 **Fixed**: Link overflow issues in small screens
- 🐛 **Fixed**: Domain replacement logic for custom protocols

## 🤝 Contributing

We welcome contributions to improve this plugin:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Release plugin
npm run release:publish
```

## 📝 Plugin Information

- **Version**: 1.0.0
- **Author**: Manus
- **License**: MIT
- **Minimum Blinko Version**: 0.0.0
- **Plugin ID**: custom-share-domain-plugin
- **Repository**: https://github.com/xiaobaiweinuli/custom-share-domain-plugin

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the Blinko team for the excellent plugin system
- Community feedback and feature requests
- All contributors who helped improve this plugin

---

**Made with ❤️ for the Blinko community**

