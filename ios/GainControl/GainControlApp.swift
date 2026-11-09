// Gain Control for iPhone and iPad: the web game, bundled and run offline in a full-screen web view.
// The game's files (everything in ../game) are copied into the app at build time (the "Bundle the game"
// build phase) and served from a tiny local web server, so ES modules, localStorage progress, Web Audio
// and fetch() all behave exactly as they do on the web. Same arrangement as Townies.
import SwiftUI
import AVFoundation

@main
struct GainControlApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var server = LocalServer.shared

    init() {
        // Play along with whatever else is playing, and respect the silent switch, like most games.
        // (off the main thread: activating the session can block for a moment)
        DispatchQueue.global(qos: .userInitiated).async {
            try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
            try? AVAudioSession.sharedInstance().setActive(true)
        }
        LocalServer.shared.start()
    }

    // `-GainControlHash act3` as a launch argument (or in Xcode's scheme) opens a test hash, the same as
    // index.html#act3 on the web; used for simulator screenshots in CI
    private var startURL: URL {
        var c = URLComponents(url: server.baseURL.appendingPathComponent("index.html"), resolvingAgainstBaseURL: false)!
        if let h = UserDefaults.standard.string(forKey: "GainControlHash"), !h.isEmpty { c.fragment = h }
        return c.url!
    }

    var body: some Scene {
        WindowGroup {
            ZStack {
                Color.black.ignoresSafeArea()
                if server.ready {
                    GameScreen(url: startURL)
                } else if let err = server.error {
                    Text("Gain Control couldn't start its local server.\n\(err)")
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.center)
                        .padding()
                } else {
                    ProgressView().tint(.white)
                }
            }
            .statusBarHidden(true)
            .persistentSystemOverlays(.hidden)
        }
        .onChange(of: scenePhase) { _, phase in
            // iOS can tear down the listening socket while the app is suspended; bring it back.
            if phase == .active { LocalServer.shared.start() }
        }
    }
}
