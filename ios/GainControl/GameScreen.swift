import SwiftUI

/// The whole app screen: the game, edge to edge. Its menus, cards and HUD are the game's own
/// (the page letterboxes itself to 16:9 and keeps clear of the notch and home indicator).
struct GameScreen: View {
    let url: URL
    @StateObject private var bridge = GameBridge()

    var body: some View {
        GameWebView(url: url, bridge: bridge)
            .ignoresSafeArea()
            .background(Color.black.ignoresSafeArea())
            .defersSystemGestures(on: .all) // a swipe near the edge is a tap in the game first
    }
}
