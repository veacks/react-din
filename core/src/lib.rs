use std::f64::consts::PI;

pub const PATCH_DOCUMENT_VERSION: u32 = 1;
pub const PATCH_INPUT_HANDLE_PREFIX: &str = "param:";

fn safe_number(value: f64) -> f64 {
    if value.is_finite() { value } else { 0.0 }
}

fn clamp_range(value: f64, min: f64, max: f64, mode: &str) -> f64 {
    let mut min_value = min;
    let mut max_value = max;
    if mode == "range" && min_value > max_value {
        std::mem::swap(&mut min_value, &mut max_value);
    }
    value.max(min_value).min(max_value)
}

fn wrap_value(value: f64, min: f64, max: f64) -> f64 {
    let range = max - min;
    if !range.is_finite() || range == 0.0 {
        return min;
    }

    let wrapped = ((value - min) % range + range) % range;
    wrapped + min
}

fn floored_modulo(value: f64, divisor: f64) -> f64 {
    if !divisor.is_finite() || divisor == 0.0 {
        return 0.0;
    }
    value - (value / divisor).floor() * divisor
}

fn ping_pong_value(value: f64, length: f64) -> f64 {
    if !length.is_finite() || length == 0.0 {
        return 0.0;
    }
    let range = length * 2.0;
    let wrapped = wrap_value(value, 0.0, range);
    length - (wrapped - length).abs()
}

fn smooth_min_value(a: f64, b: f64, k: f64) -> f64 {
    let smooth = k.max(0.0001);
    let h = clamp_range(0.5 + 0.5 * (b - a) / smooth, 0.0, 1.0, "minmax");
    (b * (1.0 - h) + a * h) - smooth * h * (1.0 - h)
}

fn normalize_accents(value: &str) -> String {
    value
        .replace('é', "e")
        .replace('è', "e")
        .replace('ê', "e")
        .replace('ë', "e")
        .replace('à', "a")
        .replace('â', "a")
        .replace('ä', "a")
        .replace('î', "i")
        .replace('ï', "i")
        .replace('ô', "o")
        .replace('ö', "o")
        .replace('ù', "u")
        .replace('û', "u")
        .replace('ü', "u")
}

fn french_to_english(note: &str) -> String {
    let normalized = normalize_accents(note);
    let lower = normalized.to_lowercase();

    for (french, english) in [
        ("sol", "G"),
        ("do", "C"),
        ("re", "D"),
        ("mi", "E"),
        ("fa", "F"),
        ("la", "A"),
        ("si", "B"),
    ] {
        if let Some(suffix) = lower.strip_prefix(french) {
            let accidental = if suffix == "#" || suffix == "b" { suffix } else { "" };
            return format!("{}{}", english, accidental);
        }
    }

    normalized
}

fn note_to_semitone(note: &str) -> Option<i32> {
    match note {
        "C" | "B#" => Some(0),
        "C#" | "Db" => Some(1),
        "D" => Some(2),
        "D#" | "Eb" => Some(3),
        "E" | "Fb" => Some(4),
        "F" | "E#" => Some(5),
        "F#" | "Gb" => Some(6),
        "G" => Some(7),
        "G#" | "Ab" => Some(8),
        "A" => Some(9),
        "A#" | "Bb" => Some(10),
        "B" | "Cb" => Some(11),
        _ => None,
    }
}

fn sharp_name(semitone: i32) -> &'static str {
    match semitone.rem_euclid(12) {
        0 => "C",
        1 => "C#",
        2 => "D",
        3 => "D#",
        4 => "E",
        5 => "F",
        6 => "F#",
        7 => "G",
        8 => "G#",
        9 => "A",
        10 => "A#",
        _ => "B",
    }
}

fn flat_name(semitone: i32) -> &'static str {
    match semitone.rem_euclid(12) {
        0 => "C",
        1 => "Db",
        2 => "D",
        3 => "Eb",
        4 => "E",
        5 => "F",
        6 => "Gb",
        7 => "G",
        8 => "Ab",
        9 => "A",
        10 => "Bb",
        _ => "B",
    }
}

pub fn math(operation: &str, a: f64, b: f64, c: f64) -> f64 {
    let av = safe_number(a);
    let bv = safe_number(b);
    let cv = safe_number(c);

    match operation {
        "add" => av + bv,
        "subtract" => av - bv,
        "multiply" => av * bv,
        "divide" => if bv == 0.0 { 0.0 } else { av / bv },
        "multiplyAdd" => av * bv + cv,
        "power" => av.powf(bv),
        "logarithm" => {
            if av <= 0.0 {
                0.0
            } else if !bv.is_finite() || bv <= 0.0 || bv == 1.0 {
                av.ln()
            } else {
                av.ln() / bv.ln()
            }
        }
        "sqrt" => if av < 0.0 { 0.0 } else { av.sqrt() },
        "invSqrt" => if av <= 0.0 { 0.0 } else { 1.0 / av.sqrt() },
        "abs" => av.abs(),
        "exp" => av.exp(),
        "min" => av.min(bv),
        "max" => av.max(bv),
        "lessThan" => if av < bv { 1.0 } else { 0.0 },
        "greaterThan" => if av > bv { 1.0 } else { 0.0 },
        "sign" => if av == 0.0 { 0.0 } else if av > 0.0 { 1.0 } else { -1.0 },
        "compare" => if av == bv { 0.0 } else if av > bv { 1.0 } else { -1.0 },
        "smoothMin" => smooth_min_value(av, bv, cv),
        "smoothMax" => -smooth_min_value(-av, -bv, cv),
        "round" => av.round(),
        "floor" => av.floor(),
        "ceil" => av.ceil(),
        "truncate" => av.trunc(),
        "fraction" => av - av.floor(),
        "truncModulo" => if bv == 0.0 { 0.0 } else { av % bv },
        "floorModulo" => floored_modulo(av, bv),
        "wrap" => wrap_value(av, bv, cv),
        "snap" => if bv == 0.0 { av } else { (av / bv).round() * bv },
        "pingPong" => ping_pong_value(av, bv),
        "sin" => av.sin(),
        "cos" => av.cos(),
        "tan" => av.tan(),
        "asin" => av.asin(),
        "acos" => av.acos(),
        "atan" => av.atan(),
        "atan2" => av.atan2(bv),
        "sinh" => av.sinh(),
        "cosh" => av.cosh(),
        "tanh" => av.tanh(),
        _ => 0.0,
    }
}

pub fn compare(operation: &str, a: f64, b: f64) -> f64 {
    let av = safe_number(a);
    let bv = safe_number(b);

    match operation {
        "gt" => if av > bv { 1.0 } else { 0.0 },
        "gte" => if av >= bv { 1.0 } else { 0.0 },
        "lt" => if av < bv { 1.0 } else { 0.0 },
        "lte" => if av <= bv { 1.0 } else { 0.0 },
        "eq" => if av == bv { 1.0 } else { 0.0 },
        "neq" => if av != bv { 1.0 } else { 0.0 },
        _ => 0.0,
    }
}

pub fn mix(a: f64, b: f64, t: f64, clamp_mix: bool) -> f64 {
    let mix_value = if clamp_mix { clamp_range(t, 0.0, 1.0, "minmax") } else { t };
    a * (1.0 - mix_value) + b * mix_value
}

pub fn clamp(value: f64, min: f64, max: f64, mode: &str) -> f64 {
    clamp_range(value, min, max, mode)
}

pub fn switch_value(index: f64, values: Box<[f64]>, fallback: f64) -> f64 {
    if values.is_empty() {
        return fallback;
    }

    let safe_index = index.floor().max(0.0).min((values.len() - 1) as f64) as usize;
    let value = values[safe_index];
    if value.is_finite() { value } else { fallback }
}

pub fn midi_to_freq(midi: f64) -> f64 {
    440.0 * 2.0_f64.powf((midi - 69.0) / 12.0)
}

pub fn midi_to_note(midi: f64, prefer_flats: bool) -> String {
    let midi_rounded = midi.round() as i32;
    let octave = midi_rounded.div_euclid(12) - 1;
    let semitone = midi_rounded.rem_euclid(12);
    let note = if prefer_flats { flat_name(semitone) } else { sharp_name(semitone) };
    format!("{}{}", note, octave)
}

pub fn note_to_midi(note: &str, octave: Option<i32>) -> Result<i32, String> {
    let full_note = if let Some(octave_value) = octave {
        format!("{}{}", note, octave_value)
    } else {
        note.to_string()
    };
    parse_note_midi(&full_note)
}

pub fn note_to_freq(note: &str, octave: Option<i32>) -> Result<f64, String> {
    let midi = note_to_midi(note, octave)?;
    Ok(midi_to_freq(midi as f64))
}

fn parse_note_midi(note: &str) -> Result<i32, String> {
    let normalized = normalize_accents(note.trim());
    let mut chars = normalized.chars().peekable();
    let mut note_part = String::new();
    while let Some(ch) = chars.peek() {
        if ch.is_ascii_alphabetic() || *ch == '#' || *ch == 'b' {
            note_part.push(*ch);
            chars.next();
        } else {
            break;
        }
    }

    let octave_part: String = chars.collect();
    let translated = french_to_english(&note_part);
    let canonical = if translated.len() >= 2 {
        format!(
            "{}{}",
            translated.chars().next().unwrap().to_ascii_uppercase(),
            translated.chars().skip(1).collect::<String>().to_ascii_lowercase()
        )
    } else {
        translated.to_ascii_uppercase()
    };

    let semitone = note_to_semitone(&canonical)
        .ok_or_else(|| format!("Unknown note name: \"{}\"", note))?;
    let octave = if octave_part.is_empty() {
        4
    } else {
        octave_part.parse::<i32>().map_err(|_| format!("Invalid note format: \"{}\"", note))?
    };

    Ok((octave + 1) * 12 + semitone)
}

pub fn note_to_french(note: &str) -> String {
    let lower = note.trim();
    let (base, accidental) = match lower.chars().next() {
        Some(_) => (&lower[0..1].to_ascii_uppercase(), &lower[1..]),
        None => return String::new(),
    };
    let french = match base.as_str() {
        "C" => "Do",
        "D" => "Re",
        "E" => "Mi",
        "F" => "Fa",
        "G" => "Sol",
        "A" => "La",
        "B" => "Si",
        _ => return note.to_string(),
    };
    format!("{}{}", french, accidental)
}

pub fn note_from_french(note: &str) -> String {
    french_to_english(note)
}

pub fn create_wave_shaper_curve(amount: f64, preset: &str, samples: usize) -> Vec<f32> {
    let sample_count = if samples == 0 { 512 } else { samples };
    let mut curve = vec![0.0; sample_count];
    let k = amount.max(0.0) * 100.0;

    for (index, sample) in curve.iter_mut().enumerate() {
        let x = (index as f64 * 2.0) / sample_count as f64 - 1.0;
        *sample = match preset {
            "hardClip" => x.mul_add(1.0 + k / 8.0, 0.0).clamp(-1.0, 1.0) as f32,
            "saturate" => {
                let amt = 1.0 + k / 20.0;
                (((3.0 + amt) * x * 20.0) / (PI + (amt * (x * 20.0).abs()))) as f32
            }
            _ => (x * (1.0 + k / 12.0)).tanh() as f32,
        };
    }

    curve
}

pub fn create_distortion_curve(curve_type: &str, drive: f64, samples: usize) -> Vec<f32> {
    let sample_count = if samples == 0 { 256 } else { samples };
    let mut curve = vec![0.0; sample_count];
    let k = drive * 100.0;

    for (index, sample) in curve.iter_mut().enumerate() {
        let x = (index as f64 * 2.0) / sample_count as f64 - 1.0;
        *sample = match curve_type {
            "soft" => (x * (1.0 + k / 10.0)).tanh() as f32,
            "hard" => x.mul_add(1.0 + k / 5.0, 0.0).clamp(-1.0, 1.0) as f32,
            "fuzz" => {
                if x >= 0.0 {
                    x.mul_add(1.0 + k / 3.0, 0.0).min(1.0) as f32
                } else {
                    (x.mul_add(1.0 + k / 2.0, (x * k).sin() * 0.1)).max(-1.0) as f32
                }
            }
            "bitcrush" => {
                let bits = (16.0 - (k / 10.0).floor()).max(2.0);
                let steps = 2.0_f64.powf(bits);
                ((x * steps).round() / steps) as f32
            }
            "saturate" => {
                let amt = 1.0 + k / 20.0;
                (((3.0 + amt) * x * 20.0) / (PI + (amt * (x * 20.0).abs()))) as f32
            }
            _ => x as f32,
        };
    }

    curve
}

pub fn fill_noise_samples(noise_type: &str, sample_count: usize) -> Vec<f32> {
    let mut seed: u64 = 0x1234_5678_abcd_ef01;
    let mut next_white = || {
        seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
        let normalized = ((seed >> 33) as f64) / ((1_u64 << 31) as f64);
        normalized * 2.0 - 1.0
    };

    let mut buffer = vec![0.0; sample_count];
    match noise_type {
        "pink" => {
            let (mut b0, mut b1, mut b2, mut b3, mut b4, mut b5, mut b6) = (0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
            for sample in &mut buffer {
                let white = next_white();
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.969 * b2 + white * 0.153852;
                b3 = 0.8665 * b3 + white * 0.3104856;
                b4 = 0.55 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.016898;
                *sample = ((b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11) as f32;
                b6 = white * 0.115926;
            }
        }
        "brown" => {
            let mut last_out = 0.0;
            for sample in &mut buffer {
                let white = next_white();
                let value = (last_out + 0.02 * white) / 1.02;
                last_out = value;
                *sample = (value * 3.5) as f32;
            }
        }
        "blue" => {
            let mut last_sample = 0.0;
            for sample in &mut buffer {
                let white = next_white();
                *sample = (white - last_sample) as f32;
                last_sample = white;
            }
        }
        "violet" => {
            let (mut last_1, mut last_2) = (0.0, 0.0);
            for sample in &mut buffer {
                let white = next_white();
                let diff_1 = white - last_1;
                *sample = (diff_1 - last_2) as f32;
                last_2 = diff_1;
                last_1 = white;
            }
        }
        _ => {
            for sample in &mut buffer {
                *sample = next_white() as f32;
            }
        }
    }

    buffer
}

pub fn resolve_patch_asset_path(asset_path: Option<String>, asset_root: Option<String>) -> Option<String> {
    let asset_path = asset_path?;
    let asset_root = asset_root?;

    if asset_path.contains("://") || asset_path.starts_with("blob:") || asset_path.starts_with("data:") {
        return Some(asset_path);
    }

    let normalized_root = asset_root.trim_end_matches('/');
    let normalized_path = if asset_path.starts_with('/') {
        asset_path
    } else {
        format!("/{}", asset_path)
    };

    Some(format!("{}{}", normalized_root, normalized_path))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn math_and_compare_match_expected_guards() {
        assert_eq!(math("add", 2.0, 3.0, 0.0), 5.0);
        assert_eq!(math("divide", 10.0, 0.0, 0.0), 0.0);
        assert_eq!(compare("gte", 4.0, 4.0), 1.0);
        assert_eq!(clamp(3.0, 5.0, 1.0, "range"), 3.0);
        assert_eq!(switch_value(1.0, vec![10.0, 20.0, 30.0].into_boxed_slice(), 99.0), 20.0);
    }

    #[test]
    fn note_helpers_stay_aligned() {
        assert_eq!(note_to_midi("C4", None).unwrap(), 60);
        assert!((midi_to_freq(69.0) - 440.0).abs() < 0.0001);
        assert_eq!(midi_to_note(61.0, true), "Db4");
        assert_eq!(note_from_french("Sol#"), "G#");
        assert_eq!(note_to_french("A"), "La");
    }

    #[test]
    fn wave_shaper_curve_produces_requested_length() {
        let curve = create_wave_shaper_curve(0.45, "saturate", 32);
        assert_eq!(curve.len(), 32);
        assert!(curve.iter().all(|value| value.is_finite()));
    }

    #[test]
    fn patch_asset_path_resolution_keeps_absolute_and_prefixes_relative() {
        assert_eq!(
            resolve_patch_asset_path(Some("samples/kick.wav".to_string()), Some("/public".to_string())),
            Some("/public/samples/kick.wav".to_string())
        );
        assert_eq!(
            resolve_patch_asset_path(Some("blob:test".to_string()), Some("/public".to_string())),
            Some("blob:test".to_string())
        );
    }
}
