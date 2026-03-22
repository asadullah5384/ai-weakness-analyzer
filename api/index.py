import sys
import os

# Add backend directory to path so main can find its modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app
from mangum import Mangum

handler = Mangum(app)
