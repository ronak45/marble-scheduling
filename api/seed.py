import random
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import SessionLocal, create_tables
from models import InsurancePayer, Therapist, TherapistInsurance, Availability

def seed_database():
    print("🌱 Starting seed...")

    create_tables()
    db: Session = SessionLocal()

    try:
        insurance_payers_data = [
            {"id": "bluecross", "name": "Blue Cross Blue Shield"},
            {"id": "aetna", "name": "Aetna"},
            {"id": "cigna", "name": "Cigna"},
            {"id": "medicaid", "name": "Medicaid"},
            {"id": "united", "name": "United Healthcare"},
            {"id": "kaiser", "name": "Kaiser Permanente"},
            {"id": "humana", "name": "Humana"},
        ]

        for payer_data in insurance_payers_data:
            existing = db.query(InsurancePayer).filter_by(id=payer_data["id"]).first()
            if not existing:
                db.add(InsurancePayer(**payer_data))
        db.commit()
        print("✅ Created insurance payers")

        therapists_data = [
            {"id": f"t{i+1}", "name": f"Dr. Therapist {i+1}"} for i in range(16)
        ]

        for therapist_data in therapists_data:
            existing = db.query(Therapist).filter_by(id=therapist_data["id"]).first()
            if not existing:
                db.add(Therapist(**therapist_data))
        db.commit()
        print("✅ Created therapists")

        payer_assignments = {
            "t1": ["aetna", "kaiser"],
            "t2": ["aetna", "medicaid"],
            "t3": ["bluecross", "aetna"],
            "t4": ["bluecross", "cigna"],
            "t5": ["aetna", "cigna", "united"],
            "t6": ["bluecross", "aetna"],
            "t7": ["bluecross", "aetna", "cigna", "united"],
            "t8": ["aetna", "cigna"],
            "t9": ["aetna", "cigna", "humana"],
            "t10": ["aetna", "cigna", "medicaid"],
            "t11": ["aetna"],
            "t12": ["cigna", "united"],
            "t13": ["cigna"],
            "t14": ["kaiser", "cigna"],
            "t15": ["medicaid", "bluecross"],
            "t16": ["aetna", "bluecross", "cigna", "united"],
        }

        for therapist_id, payer_ids in payer_assignments.items():
            for payer_id in payer_ids:
                exists = db.query(TherapistInsurance).filter_by(
                    therapist_id=therapist_id,
                    insurance_payer_id=payer_id
                ).first()
                if not exists:
                    db.add(TherapistInsurance(therapist_id=therapist_id, insurance_payer_id=payer_id))
        db.commit()
        print("✅ Created therapist-insurance relationships")

        now = datetime.now()
        start_date = now + timedelta(days=1)
        start_date = start_date.replace(hour=9, minute=0, second=0, microsecond=0)

        slot_times = [9, 10, 13, 14]
        availabilities = []

        therapists = db.query(Therapist).all()
        possible_hours = list(range(9, 18))  # 9am-5pm
        
        for therapist in therapists:
            for day in range(3, 14):
                current_date = start_date + timedelta(days=day)
                
                # Randomly select 4-8 time slots for each day
                num_slots = random.randint(4, 8)
                slot_times = []
                while len(slot_times) < num_slots:
                    random_hour = random.choice(possible_hours)
                    if random_hour not in slot_times:
                        slot_times.append(random_hour)
                slot_times.sort()

                for hour in slot_times:
                    start_time = current_date.replace(hour=hour)
                    end_time = start_time + timedelta(hours=1)
                    availabilities.append(
                        Availability(
                            therapist_id=therapist.id,
                            start_time=start_time,
                            end_time=end_time
                        )
                    )

        db.bulk_save_objects(availabilities)
        db.commit()
        print(f"✅ Created {len(availabilities)} availabilities")
        print("🎉 Seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
