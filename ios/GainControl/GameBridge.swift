import SwiftUI
import WebKit
import UIKit

/// The few things the game asks of the app (see game/js/native.js): haptics on some sound effects, log lines, and
/// saving files from the perception console (results, scripts), which a web view can't download by itself.
final class GameBridge: ObservableObject {
    weak var webView: WKWebView?
    @Published var shareURL: URL?

    func receive(_ raw: String) {
        guard let data = raw.data(using: .utf8),
              let msg = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = msg["type"] as? String else { return }
        switch type {
        case "haptic": Haptics.play(msg["kind"] as? String ?? "")
        case "log": print("[GainControl] \(msg["msg"] as? String ?? "")")
        case "save": save(name: msg["name"] as? String ?? "results.csv", b64: msg["b64"] as? String ?? "")
        default: break
        }
    }

    // write it to a temporary file named as the page asked, then offer the share sheet (Save to Files, AirDrop, Mail)
    private func save(name: String, b64: String) {
        guard let data = Data(base64Encoded: b64) else { return }
        let safe = name.replacingOccurrences(of: "/", with: "-")
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("exports", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let url = dir.appendingPathComponent(safe)
        do { try data.write(to: url, options: .atomic) } catch { print("[GainControl] save failed: \(error)"); return }
        DispatchQueue.main.async { self.shareURL = url }
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
