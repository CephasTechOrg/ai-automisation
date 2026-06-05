from app.services.core_services import slugify

def test_slugify(): assert slugify('Bright Cleaning Services!') == 'bright-cleaning-services'
