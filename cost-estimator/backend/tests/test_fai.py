import json
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.api.fai_ai import BalloonAiRequest, analyze_fai_drawing


class FaiValidationTests(unittest.TestCase):
    def test_missing_and_nonfinite_positions_are_not_invented(self):
        rows = [
            {"text": "20", "xPct": 10, "yPct": 20},
            {"text": "20", "xPct": 50, "yPct": 20},
            {"text": "30"},
            {"text": "40", "xPct": float('nan'), "yPct": 20},
            {"text": "50", "xPct": 101, "yPct": 20},
        ]
        with patch('app.api.fai_ai.get_settings', return_value=SimpleNamespace(openai_api_key='test', openai_model='test')), patch('app.api.fai_ai.OpenAI') as client:
            client.return_value.responses.create.return_value.output_text = json.dumps({'dimensions': rows, 'notes': 'invalid-list'})
            result = analyze_fai_drawing(BalloonAiRequest(image_data_url='data:image/png;base64,' + 'A' * 32))
        self.assertEqual(len(result['dimensions']), 2)
        self.assertEqual(result['notes'], [])
