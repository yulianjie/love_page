
from fastapi import FastAPI, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import datetime
from typing import List, Optional
from pydantic import BaseModel
import os

# Create app
app = FastAPI(title="Like_Girl v5.2.0")

# Setup templates and static files
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./love_diary.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class LoveDiary(Base):
    __tablename__ = "love_diary"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    image_path = Column(String, nullable=True)

class LovePhoto(Base):
    __tablename__ = "love_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    image_path = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LoveList(Base):
    __tablename__ = "love_list"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    status = Column(Integer, default=0)  # 0: not done, 1: done
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for validation
class DiaryCreate(BaseModel):
    title: str
    content: str
    image_path: Optional[str] = None

class PhotoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_path: str

class ListItemCreate(BaseModel):
    title: str

class MessageCreate(BaseModel):
    name: str
    content: str

# Routes
@app.get("/", response_class=HTMLResponse)
async def home(request: Request, db: Session = Depends(get_db)):
    # Calculate days together
    start_date = datetime.datetime(2022, 1, 1)  # Change this to your actual start date
    days_together = (datetime.datetime.now() - start_date).days
    
    return templates.TemplateResponse(
        "index.html", 
        {
            "request": request, 
            "days": days_together,
            "hours": datetime.datetime.now().hour,
            "minutes": datetime.datetime.now().minute,
            "seconds": datetime.datetime.now().second
        }
    )

@app.get("/diary", response_class=HTMLResponse)
async def diary_page(request: Request, db: Session = Depends(get_db)):
    diaries = db.query(LoveDiary).order_by(LoveDiary.created_at.desc()).all()
    return templates.TemplateResponse("diary.html", {"request": request, "diaries": diaries})

@app.post("/diary")
async def create_diary(diary: DiaryCreate, db: Session = Depends(get_db)):
    db_diary = LoveDiary(**diary.dict())
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)
    return {"status": "success", "diary": db_diary}

@app.get("/photos", response_class=HTMLResponse)
async def photos_page(request: Request, db: Session = Depends(get_db)):
    photos = db.query(LovePhoto).order_by(LovePhoto.created_at.desc()).all()
    return templates.TemplateResponse("photos.html", {"request": request, "photos": photos})

@app.post("/photos")
async def create_photo(photo: PhotoCreate, db: Session = Depends(get_db)):
    db_photo = LovePhoto(**photo.dict())
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return {"status": "success", "photo": db_photo}

@app.get("/list", response_class=HTMLResponse)
async def list_page(request: Request, db: Session = Depends(get_db)):
    items = db.query(LoveList).order_by(LoveList.created_at.desc()).all()
    return templates.TemplateResponse("list.html", {"request": request, "items": items})

@app.post("/list")
async def create_list_item(item: ListItemCreate, db: Session = Depends(get_db)):
    db_item = LoveList(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return {"status": "success", "item": db_item}

@app.post("/list/{item_id}/toggle")
async def toggle_list_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LoveList).filter(LoveList.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.status = 1 if item.status == 0 else 0
    db.commit()
    return {"status": "success", "new_status": item.status}

@app.get("/messages", response_class=HTMLResponse)
async def messages_page(request: Request, db: Session = Depends(get_db)):
    messages = db.query(Message).order_by(Message.created_at.desc()).all()
    return templates.TemplateResponse("messages.html", {"request": request, "messages": messages})

@app.post("/messages")
async def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    db_message = Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return {"status": "success", "message": db_message}

@app.get("/about", response_class=HTMLResponse)
async def about_page(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)