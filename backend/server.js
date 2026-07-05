Now I have design guidelines. Let me plan and build in parallel.

<Plan>
1. Backend: rewrite server.py with FastAPI + MongoDB
   - Models: HazardReport, Campaign, SafetyTip, EmergencyContact, Facility
   - Endpoints under /api: reports (POST/GET), campaigns, tips, facilities, emergency-contacts
   - Seed initial data on startup (campaigns, tips, facilities, contacts)

2. Frontend (Expo Router file-based routing)
   - app/index.tsx → redirect to (tabs)
   - app/(tabs)/_layout.tsx → 4 bottom tabs (Home, Report, Learn, Help) with blur bar
   - app/(tabs)/index.tsx → Home dashboard (hero card, mini map preview, campaigns hscroll)
   - app/(tabs)/report.tsx → Category grid, photo placeholder, description, address, submit
   - app/(tabs)/learn.tsx → Featured article hero + tip list
   - app/(tabs)/help.tsx → Pulsing SOS + quick dials + nearby facilities + my reports
   - app/tip/[id].tsx and app/campaign/[id].tsx → detail views

3. Use existing packages only. Use Ionicons. Device ID from AsyncStorage (uuid).

Let me build now:
Action: file_editor create /app/backend/server.py --file-text "from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title=\"Safe Roads API\")
api_router = APIRouter(prefix=\"/api\")


# ---------- Models ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class HazardReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    category: str  # pothole | signal | accident | debris | streetlight | other
    description: str
    address: str = \"\"
    photo_base64: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = \"submitted\"  # submitted | reviewing | in_progress | resolved
    created_at: str = Field(default_factory=now_iso)


class HazardReportCreate(BaseModel):
    device_id: str
    category: str
    description: str
    address: str = \"\"
    photo_base64: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class Campaign(BaseModel):
    id: str
    title: str
    subtitle: str
    body: str
    image_url: str
    tag: str
    published_at: str


class SafetyTip(BaseModel):
    id: str
    title: str
    summary: str
    body: str
    category: str  # driving | pedestrian | signals | winter | children
    icon: str  # ionicons name
    image_url: str
    read_minutes: int


class EmergencyContact(BaseModel):
    id: str
    name: str
    number: str
    icon: str
    color: str


class Facility(BaseModel):
    id: str
    name: str
    type: str  # hospital | police | fuel
    address: str
    phone: str
    distance_km: float


# ---------- Seed data ----------
SEED_CAMPAIGNS = [
    {
        \"id\": \"c1\",
        \"title\": \"Wear a Helmet, Always\",
        \"subtitle\": \"New nationwide safety drive\",
        \"body\": \"The Road Safety Department has launched a nationwide drive to boost helmet compliance among two-wheeler riders. Statistics show that a properly worn ISI-certified helmet reduces the risk of fatal injury by 42%.\",
        \"image_url\": \"https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=940&q=80\",
        \"tag\": \"Campaign\",
        \"published_at\": \"2026-05-01T09:00:00Z\",
    },
    {
        \"id\": \"c2\",
        \"title\": \"School Zone Speed Limit — 25 km/h\",
        \"subtitle\": \"Effective from June 1\",
        \"body\": \"All motorists must reduce speed to 25 km/h within 200m of school premises between 7 AM and 5 PM on weekdays. Enforcement cameras have been installed at 320 school zones.\",
        \"image_url\": \"https://images.pexels.com/photos/8640996/pexels-photo-8640996.jpeg?auto=compress&cs=tinysrgb&w=940\",
        \"tag\": \"Advisory\",
        \"published_at\": \"2026-04-22T10:00:00Z\",
    },
    {
        \"id\": \"c3\",
        \"title\": \"Monsoon Driving Advisory\",
        \"subtitle\": \"Stay safe during heavy rains\",
        \"body\": \"Reduce speed by 30%, maintain double the usual following distance, use low-beam headlights, and avoid waterlogged underpasses. Emergency response teams are on 24/7 standby.\",
        \"image_url\": \"https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=940&q=80\",
        \"tag\": \"Advisory\",
        \"published_at\": \"2026-04-10T08:00:00Z\",
    },
]

SEED_TIPS = [
    {
        \"id\": \"t1\",
        \"title\": \"Understanding Traffic Signals\",
        \"summary\": \"Red, amber and green — what each really means, plus the flashing variants.\",
        \"body\": \"A steady red light means come to a complete stop before the stop line. A steady amber light means prepare to stop — do not attempt to accelerate through. Green means proceed only if the intersection is clear. Flashing amber signals caution — slow down and yield to pedestrians. Flashing red is treated as a stop sign — halt completely, then proceed when safe.\",
        \"category\": \"signals\",
        \"icon\": \"traffic-light\",
        \"image_url\": \"https://images.unsplash.com/photo-1557404763-69708cd8b9ce?auto=format&fit=crop&w=940&q=80\",
        \"read_minutes\": 3,
    },
    {
        \"id\": \"t2\",
        \"title\": \"Safe Driving in Monsoon\",
        \"summary\": \"Six practical rules to keep you safe in heavy rain.\",
        \"body\": \"1. Check your tyre tread depth — anything under 3mm is unsafe on wet roads. 2. Reduce speed by at least 30%. 3. Use low-beam headlights — high beams reflect off rain and reduce visibility. 4. Avoid sudden braking; pump the brake gently. 5. Keep double the usual following distance. 6. Never attempt to cross flowing water — turn around, don't drown.\",
        \"category\": \"driving\",
        \"icon\": \"rainy\",
        \"image_url\": \"https://images.unsplash.com/photo-1527766833261-b09c3163a791?auto=format&fit=crop&w=940&q=80\",
        \"read_minutes\": 4,
    },
    {
        \"id\": \"t3\",
        \"title\": \"Pedestrian Safety Basics\",
        \"summary\": \"Walk defensively — assume drivers cannot see you.\",
        \"body\": \"Always cross at zebra crossings. Make eye contact with drivers before stepping onto the road. Wear reflective or light-coloured clothing at night. Never step out from between parked vehicles. When walking on roads without footpaths, walk facing oncoming traffic and stay as far to the right as possible.\",
        \"category\": \"pedestrian\",
        \"icon\": \"walk\",
        \"image_url\": \"https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=940&q=80\",
        \"read_minutes\": 2,
    },
    {
        \"id\": \"t4\",
        \"title\": \"Child Passenger Safety\",
        \"summary\": \"Correct car seats save lives — here's how to choose one.\",
        \"body\": \"Infants under 2 must ride in a rear-facing seat. Children 2–4 use a forward-facing harness seat. Ages 4–12 need a booster with the seat belt across the collarbone (not neck) and lap belt on the upper thighs. Never place a child in the front seat with an active airbag.\",
        \"category\": \"children\",
        \"icon\": \"happy\",
        \"image_url\": \"https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=940&q=80\",
        \"read_minutes\": 3,
    },
    {
        \"id\": \"t5\",
        \"title\": \"Don't Drink and Drive\",
        \"summary\": \"Even one drink slows reaction time significantly.\",
        \"body\": \"The legal BAC limit in most jurisdictions is 0.03%. However, impairment begins with the very first drink — reaction time slows by up to 200ms after a single unit of alcohol. Plan a designated driver, use ride-hailing, or stay overnight. Penalties include license suspension and imprisonment.\",
        \"category\": \"driving\",
        \"icon\": \"beer\",
        \"image_url\": \"https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=940&q=80\",
        \"read_minutes\": 2,
    },
    {
        \"id\": \"t6\",
        \"title\": \"Night Driving Essentials\",
        \"summary\": \"Reduced visibility demands adjusted habits.\",
        \"body\": \"Clean your windshield inside and out — smudges scatter oncoming light. Dim your dashboard to reduce reflections. Look slightly to the right of oncoming headlights to avoid glare. Reduce speed by 20% and increase following distance. Take a 15-min break every 2 hours to combat fatigue.\",
        \"category\": \"driving\",
        \"icon\": \"moon\",
        \"image_url\": \"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=940&q=80\",
        \"read_minutes\": 3,
    },
]

SEED_CONTACTS = [
    {\"id\": \"e1\", \"name\": \"Police\", \"number\": \"100\", \"icon\": \"shield\", \"color\": \"#1A365D\"},
    {\"id\": \"e2\", \"name\": \"Ambulance\", \"number\": \"108\", \"icon\": \"medkit\", \"color\": \"#DC2626\"},
    {\"id\": \"e3\", \"name\": \"Fire\", \"number\": \"101\", \"icon\": \"flame\", \"color\": \"#EA580C\"},
    {\"id\": \"e4\", \"name\": \"Highway Helpline\", \"number\": \"1033\", \"icon\": \"car-sport\", \"color\": \"#F59E0B\"},
    {\"id\": \"e5\", \"name\": \"Women Safety\", \"number\": \"1091\", \"icon\": \"heart\", \"color\": \"#EC4899\"},
    {\"id\": \"e6\", \"name\": \"Disaster Mgmt\", \"number\": \"1078\", \"icon\": \"warning\", \"color\": \"#7C3AED\"},
]

SEED_FACILITIES = [
    {\"id\": \"f1\", \"name\": \"City General Hospital\", \"type\": \"hospital\", \"address\": \"12 MG Road, Sector 4\", \"phone\": \"011-24567890\", \"distance_km\": 0.8},
    {\"id\": \"f2\", \"name\": \"St. Mary's Trauma Centre\", \"type\": \"hospital\", \"address\": \"45 Ring Road, Green Park\", \"phone\": \"011-26789012\", \"distance_km\": 2.3},
    {\"id\": \"f3\", \"name\": \"Apollo Emergency\", \"type\": \"hospital\", \"address\": \"8 Nehru Nagar\", \"phone\": \"011-28901234\", \"distance_km\": 3.7},
    {\"id\": \"f4\", \"name\": \"Central Police Station\", \"type\": \"police\", \"address\": \"1 Civic Centre\", \"phone\": \"011-23456789\", \"distance_km\": 1.1},
    {\"id\": \"f5\", \"name\": \"Sector 12 Police Post\", \"type\": \"police\", \"address\": \"Sector 12 Market\", \"phone\": \"011-25678901\", \"distance_km\": 2.9},
    {\"id\": \"f6\", \"name\": \"Highway Patrol Post 7\", \"type\": \"police\", \"address\": \"NH-24 Km-18\", \"phone\": \"011-27890123\", \"distance_km\": 5.2},
    {\"id\": \"f7\", \"name\": \"IndianOil Fuel Station\", \"type\": \"fuel\", \"address\": \"Ring Road Junction\", \"phone\": \"011-22334455\", \"distance_km\": 0.6},
    {\"id\": \"f8\", \"name\": \"HP Petrol Pump\", \"type\": \"fuel\", \"address\": \"44 Outer Ring Road\", \"phone\": \"011-33445566\", \"distance_km\": 1.7},
    {\"id\": \"f9\", \"name\": \"Bharat Petroleum\", \"type\": \"fuel\", \"address\": \"Sector 8 Chowk\", \"phone\": \"011-44556677\", \"distance_km\": 2.4},
]


async def seed_if_empty():
    if await db.campaigns.count_documents({}) == 0:
        await db.campaigns.insert_many([dict(c) for c in SEED_CAMPAIGNS])
    if await db.tips.count_documents({}) == 0:
        await db.tips.insert_many([dict(t) for t in SEED_TIPS])
    if await db.emergency_contacts.count_documents({}) == 0:
        await db.emergency_contacts.insert_many([dict(c) for c in SEED_CONTACTS])
    if await db.facilities.count_documents({}) == 0:
        await db.facilities.insert_many([dict(f) for f in SEED_FACILITIES])


# ---------- Routes ----------
@api_router.get(\"/\")
async def root():
    return {\"service\": \"Safe Roads API\", \"status\": \"ok\"}


@api_router.post(\"/reports\", response_model=HazardReport)
async def create_report(payload: HazardReportCreate):
    if not payload.category or not payload.description.strip():
        raise HTTPException(status_code=400, detail=\"category and description are required\")
    report = HazardReport(**payload.dict())
    await db.reports.insert_one(report.dict())
    return report


@api_router.get(\"/reports\", response_model=List[HazardReport])
async def list_reports(device_id: Optional[str] = Query(default=None)):
    q = {\"device_id\": device_id} if device_id else {}
    docs = await db.reports.find(q, {\"_id\": 0}).sort(\"created_at\", -1).to_list(200)
    return [HazardReport(**d) for d in docs]


@api_router.get(\"/reports/stats\")
async def report_stats():
    total = await db.reports.count_documents({})
    resolved = await db.reports.count_documents({\"status\": \"resolved\"})
    in_progress = await db.reports.count_documents({\"status\": {\"$in\": [\"reviewing\", \"in_progress\"]}})
    return {\"total\": total, \"resolved\": resolved, \"in_progress\": in_progress}


@api_router.get(\"/campaigns\", response_model=List[Campaign])
async def list_campaigns():
    docs = await db.campaigns.find({}, {\"_id\": 0}).to_list(100)
    return [Campaign(**d) for d in docs]


@api_router.get(\"/campaigns/{campaign_id}\", response_model=Campaign)
async def get_campaign(campaign_id: str):
    doc = await db.campaigns.find_one({\"id\": campaign_id}, {\"_id\": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=\"Not found\")
    return Campaign(**doc)


@api_router.get(\"/tips\", response_model=List[SafetyTip])
async def list_tips():
    docs = await db.tips.find({}, {\"_id\": 0}).to_list(100)
    return [SafetyTip(**d) for d in docs]


@api_router.get(\"/tips/{tip_id}\", response_model=SafetyTip)
async def get_tip(tip_id: str):
    doc = await db.tips.find_one({\"id\": tip_id}, {\"_id\": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=\"Not found\")
    return SafetyTip(**doc)


@api_router.get(\"/emergency-contacts\", response_model=List[EmergencyContact])
async def list_contacts():
    docs = await db.emergency_contacts.find({}, {\"_id\": 0}).to_list(100)
    return [EmergencyContact(**d) for d in docs]


@api_router.get(\"/facilities\", response_model=List[Facility])
async def list_facilities(type: Optional[str] = Query(default=None)):
    q = {\"type\": type} if type else {}
    docs = await db.facilities.find(q, {\"_id\": 0}).sort(\"distance_km\", 1).to_list(200)
    return [Facility(**d) for d in docs]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[\"*\"],
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event(\"startup\")
async def on_startup():
    await seed_if_empty()
    logger.info(\"Safe Roads API started, seed ensured\")


@app.on_event(\"shutdown\")
async def on_shutdown():
    client.close()
"
Observation: Overwrite successful: /app/backend/server.py