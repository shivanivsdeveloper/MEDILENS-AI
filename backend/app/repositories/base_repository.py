from typing import TypeVar, Generic, Type, List, Optional, Any
from sqlalchemy.orm import Session
from backend.app.models.database import Base

T = TypeVar("T", bound=Base)

class BaseRepository(Generic[T]):
    """
    Generic repository pattern providing decoupled database operations.
    """
    def __init__(self, model_class: Type[T], db: Session):
        self.model_class = model_class
        self.db = db

    def get_by_id(self, id: int) -> Optional[T]:
        return self.db.query(self.model_class).filter(self.model_class.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.db.query(self.model_class).offset(skip).limit(limit).all()

    def create(self, entity: T) -> T:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def update(self, entity: T) -> T:
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.db.delete(entity)
        self.db.commit()
