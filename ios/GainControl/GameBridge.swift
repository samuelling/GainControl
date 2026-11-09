import SwiftUI
import WebKit
import UIKit

/// The few things the game asks of the app (see game/js/native.js): haptics on some sound effects, and log lines.
final class GameBridge: ObservableObject {
    weak var webView: WKWebView?

    func receive(_ raw: String) {
        guard let data = raw.data(using: .utf8),
              let msg = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = msg["type"] as? String else { return }
        switch type {
        case "haptic": Haptics.play(msg["kind"] as? String ?? "")
        case "log": print("[GainControl] \(msg["msg"] as? String ?? "")")
        default: break
        }
    }
}

// MARK: - Haptics: the same moments as the sound effects (game/js/native.js picks which ones)

enum Haptics {
    static func play(_ kind: String) {
        switch kind {
        case "crash", "death", "fogSlam", "fogBam", "thud", "kick": UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        case "dart", "gavel", "stamp", "staple", "clunk", "door", "knock": UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
        case "pickup", "card", "switch", "key", "toggle", "flip": UIImpactFeedbackGenerator(style: .light).impactOccurred()
        case "select", "pop", "tick": UISelectionFeedbackGenerator().selectionChanged()
        case "score", "good": UINotificationFeedbackGenerator().notificationOccurred(.success)
        case "bad", "alarm": UINotificationFeedbackGenerator().notificationOccurred(.warning)
        default: break
        }
    }
}
