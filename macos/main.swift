// Gain Control for the Mac: the web game, bundled and run offline in a window. Same arrangement as the iPhone and
// iPad app (ios/): the game's files are copied into GainControl.app/Contents/Resources/Web at build time
// (macos/build.sh) and served from a tiny local web server on 127.0.0.1 (ios/GainControl/LocalServer.swift, shared),
// so ES modules, IndexedDB saves, Web Audio and fetch() behave exactly as on the web.
import AppKit
import Combine
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    var window: NSWindow!
    var web: WKWebView?
    let game = GameView()
    var waiting: AnyCancellable?

    func applicationDidFinishLaunching(_ note: Notification) {
        buildMenus()
        // the game is a 640×360 stage: keep the window 16:9 so it fills edge to edge
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1280, height: 720),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.title = "Gain Control"
        window.contentAspectRatio = NSSize(width: 16, height: 9)
        window.contentMinSize = NSSize(width: 768, height: 432)
        window.collectionBehavior = [.fullScreenPrimary]
        window.backgroundColor = .black
        window.center()
        window.setFrameAutosaveName("GainControlMain")
        window.delegate = self
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        let server = LocalServer.shared
        server.start()
        // open the game once the local server is listening
        waiting = server.$ready.combineLatest(server.$error).receive(on: DispatchQueue.main).sink { [weak self] ready, err in
            guard let self, self.web == nil else { return }
            if ready {
                self.web = self.game.make(url: self.startURL(server.baseURL))
                self.window.contentView = self.web
            } else if let err {
                let label = NSTextField(labelWithString: "Gain Control couldn't start its local server.\n\(err)")
                label.alignment = .center
                label.textColor = .white
                self.window.contentView = label
            }
        }
    }

    // `-GainControlHash act3` (or `defaults write com.samuelling.gaincontrol.mac GainControlHash act3`) opens a
    // test hash, the same as index.html#act3 on the web
    func startURL(_ base: URL) -> URL {
        var c = URLComponents(url: base.appendingPathComponent("index.html"), resolvingAgainstBaseURL: false)!
        if let h = UserDefaults.standard.string(forKey: "GainControlHash"), !h.isEmpty { c.fragment = h }
        return c.url!
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ app: NSApplication) -> Bool { true }

    // MARK: menus (the game's own options are its OPTIONS chip; these are the Mac's own)

    @objc func reloadGame(_ sender: Any?) { web?.reload() }
    @objc func actualSize(_ sender: Any?) { web?.pageZoom = 1 }
    @objc func zoomIn(_ sender: Any?) { if let w = web { w.pageZoom = min(2, w.pageZoom + 0.1) } }
    @objc func zoomOut(_ sender: Any?) { if let w = web { w.pageZoom = max(0.6, w.pageZoom - 0.1) } }
    @objc func openWebsite(_ sender: Any?) { NSWorkspace.shared.open(URL(string: "https://samuelling.github.io/GainControl/game/")!) }

    private func buildMenus() {
        let main = NSMenu()
        func item(_ title: String, _ action: Selector?, _ key: String = "", _ mods: NSEvent.ModifierFlags = [.command], target: AnyObject? = nil) -> NSMenuItem {
            let i = NSMenuItem(title: title, action: action, keyEquivalent: key)
            i.keyEquivalentModifierMask = mods
            if let target { i.target = target }
            return i
        }
        func menu(_ title: String, _ items: [NSMenuItem]) -> NSMenuItem {
            let top = NSMenuItem(title: title, action: nil, keyEquivalent: "")
            let m = NSMenu(title: title)
            items.forEach { m.addItem($0) }
            top.submenu = m
            main.addItem(top)
            return top
        }
        _ = menu("Gain Control", [
            item("About Gain Control", #selector(NSApplication.orderFrontStandardAboutPanel(_:)), ""),
            .separator(),
            item("Hide Gain Control", #selector(NSApplication.hide(_:)), "h"),
            item("Hide Others", #selector(NSApplication.hideOtherApplications(_:)), "h", [.command, .option]),
            item("Show All", #selector(NSApplication.unhideAllApplications(_:))),
            .separator(),
            item("Quit Gain Control", #selector(NSApplication.terminate(_:)), "q"),
        ])
        _ = menu("Edit", [
            item("Undo", Selector(("undo:")), "z"),
            item("Redo", Selector(("redo:")), "Z"),
            .separator(),
            item("Cut", #selector(NSText.cut(_:)), "x"),
            item("Copy", #selector(NSText.copy(_:)), "c"),
            item("Paste", #selector(NSText.paste(_:)), "v"),
            item("Select All", #selector(NSText.selectAll(_:)), "a"),
        ])
        _ = menu("View", [
            item("Actual Size", #selector(actualSize(_:)), "0", target: self),
            item("Zoom In", #selector(zoomIn(_:)), "+", target: self),
            item("Zoom Out", #selector(zoomOut(_:)), "-", target: self),
            .separator(),
            item("Reload", #selector(reloadGame(_:)), "r", target: self),
            item("Enter Full Screen", #selector(NSWindow.toggleFullScreen(_:)), "f", [.command, .control]),
        ])
        let win = menu("Window", [
            item("Minimize", #selector(NSWindow.performMiniaturize(_:)), "m"),
            item("Zoom", #selector(NSWindow.performZoom(_:))),
        ])
        NSApp.windowsMenu = win.submenu
        _ = menu("Help", [item("Gain Control on the Web", #selector(openWebsite(_:)), "", target: self)])
        NSApp.mainMenu = main
    }
}

/// The web view: the game's own pages load here, links out (ChairQuest, Advisor Quest) open in the browser.
final class GameView: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var home: URL?
    private weak var webView: WKWebView?

    func make(url: URL) -> WKWebView {
        home = url
        let cfg = WKWebViewConfiguration()
        cfg.mediaTypesRequiringUserActionForPlayback = []
        cfg.websiteDataStore = .default() // progress and settings (localStorage) persist
        cfg.preferences.isElementFullscreenEnabled = true // the game's FULLSCREEN (or F) takes the window full screen
        cfg.userContentController.add(self, name: "gaincontrol")
        cfg.userContentController.addUserScript(WKUserScript(
            source: "document.documentElement.classList.add('mac-app'); window.GC_APP = 'mac';",
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let wv = WKWebView(frame: .zero, configuration: cfg)
        wv.navigationDelegate = self
        wv.uiDelegate = self
        wv.allowsBackForwardNavigationGestures = false
        wv.allowsMagnification = false
        if #available(macOS 13.3, *) { wv.isInspectable = true } // Safari › Develop › Gain Control
        wv.load(URLRequest(url: url))
        webView = wv
        return wv
    }

    // the game's own pages load here; anything else (credits, sources) opens in the browser
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let u = action.request.url else { return decisionHandler(.cancel) }
        if u.host == home?.host && u.port == home?.port { return decisionHandler(.allow) }
        if action.targetFrame?.isMainFrame ?? true, ["http", "https", "mailto"].contains(u.scheme ?? "") {
            NSWorkspace.shared.open(u)
            return decisionHandler(.cancel)
        }
        decisionHandler(.allow)
    }
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let u = action.request.url { NSWorkspace.shared.open(u) }
        return nil
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        if let home { webView.load(URLRequest(url: home)) }
    }

    func userContentController(_ ucc: WKUserContentController, didReceive message: WKScriptMessage) {
        // game/js/native.js: log lines (haptics: nothing to buzz on a Mac)
        if let raw = message.body as? String,
           let msg = (try? JSONSerialization.jsonObject(with: Data(raw.utf8))) as? [String: Any],
           msg["type"] as? String == "log" {
            print("[GainControl] \(msg["msg"] as? String ?? "")")
        }
    }

    // window.alert / confirm / prompt as Mac alerts
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let a = NSAlert(); a.messageText = message; a.addButton(withTitle: "OK")
        a.runModal(); completionHandler()
    }
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let a = NSAlert(); a.messageText = message; a.addButton(withTitle: "OK"); a.addButton(withTitle: "Cancel")
        completionHandler(a.runModal() == .alertFirstButtonReturn)
    }
    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String,
                 defaultText: String?, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        let a = NSAlert(); a.messageText = prompt; a.addButton(withTitle: "OK"); a.addButton(withTitle: "Cancel")
        let field = NSTextField(frame: NSRect(x: 0, y: 0, width: 260, height: 24)); field.stringValue = defaultText ?? ""
        a.accessoryView = field
        completionHandler(a.runModal() == .alertFirstButtonReturn ? field.stringValue : nil)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
