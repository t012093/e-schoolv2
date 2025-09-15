# 体調管理機能 Pythonバックエンド設計書

## 概要
FastAPIを使用した高性能な体調管理バックエンドAPI設計

## 技術スタック

### コア技術
- **フレームワーク**: FastAPI (高速・型安全・自動ドキュメント生成)
- **データベース**: 
  - PostgreSQL (本番環境)
  - SQLite (開発環境)
- **ORM**: SQLAlchemy 2.0
- **非同期処理**: asyncio + aiohttp
- **AI/ML**: 
  - OpenAI Python SDK
  - scikit-learn (パターン分析)
  - pandas (データ処理)
- **認証**: JWT (PyJWT)
- **バリデーション**: Pydantic
- **タスクキュー**: Celery + Redis (オプション)

## プロジェクト構造

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPIアプリケーション
│   ├── config.py               # 設定管理
│   ├── database.py             # DB接続設定
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── health_check.py
│   │   │   │   ├── insights.py
│   │   │   │   ├── reports.py
│   │   │   │   └── auth.py
│   │   │   └── dependencies.py
│   │   └── middleware.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── health_check.py
│   │   ├── health_insight.py
│   │   └── health_profile.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── health_check.py
│   │   ├── insight.py
│   │   ├── report.py
│   │   └── user.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── health_tracking.py
│   │   ├── health_analysis.py
│   │   ├── ai_integration.py
│   │   └── notification.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py
│   │   ├── exceptions.py
│   │   └── utils.py
│   │
│   └── ml/
│       ├── __init__.py
│       ├── pattern_detector.py
│       ├── trend_analyzer.py
│       └── models/
│
├── tests/
├── alembic/                    # DB マイグレーション
├── requirements.txt
├── .env.example
└── docker-compose.yml
```

## データモデル (SQLAlchemy)

### 1. HealthCheck モデル
```python
# app/models/health_check.py
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base
import enum

class ConditionEnum(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    NORMAL = "normal"
    POOR = "poor"
    BAD = "bad"

class StressLevelEnum(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class HealthCheck(Base):
    __tablename__ = "health_checks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # 基本データ
    condition = Column(Enum(ConditionEnum), nullable=False)
    sleep_hours = Column(Float, nullable=False)
    sleep_quality = Column(Integer, nullable=False)  # 1-5
    stress_level = Column(Enum(StressLevelEnum), nullable=False)
    
    # 運動データ
    exercise_done = Column(Boolean, default=False)
    exercise_type = Column(String, nullable=True)
    exercise_duration = Column(Integer, nullable=True)  # minutes
    
    # オプションデータ
    mood = Column(JSON, nullable=True)  # List[str]
    meals = Column(JSON, nullable=True)  # Dict
    water_intake = Column(Integer, nullable=True)
    note = Column(String, nullable=True)
    
    # タイムスタンプ
    recorded_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーション
    user = relationship("User", back_populates="health_checks")
    
    class Config:
        orm_mode = True
```

### 2. HealthInsight モデル
```python
# app/models/health_insight.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base
import enum

class PeriodEnum(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class TrendEnum(str, enum.Enum):
    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"

class HealthInsight(Base):
    __tablename__ = "health_insights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    period = Column(Enum(PeriodEnum), nullable=False)
    
    # サマリー統計
    overall_trend = Column(Enum(TrendEnum), nullable=False)
    average_condition = Column(Float, nullable=False)
    average_sleep = Column(Float, nullable=False)
    average_stress = Column(Float, nullable=False)
    exercise_rate = Column(Float, nullable=False)  # percentage
    
    # 分析結果
    patterns = Column(JSON, nullable=False)  # List[Dict]
    recommendations = Column(JSON, nullable=False)  # List[Dict]
    alerts = Column(JSON, nullable=True)  # List[Dict]
    
    # AI生成コンテンツ
    ai_summary = Column(String, nullable=True)
    ai_advice = Column(String, nullable=True)
    
    # メタデータ
    generated_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    # リレーション
    user = relationship("User", back_populates="health_insights")
```

## Pydanticスキーマ

### 1. リクエスト/レスポンススキーマ
```python
# app/schemas/health_check.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
from uuid import UUID

class ConditionEnum(str, Enum):
    excellent = "excellent"
    good = "good"
    normal = "normal"
    poor = "poor"
    bad = "bad"

class StressLevelEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class ExerciseData(BaseModel):
    done: bool
    type: Optional[str] = None
    duration: Optional[int] = Field(None, ge=0, le=1440)  # 0-1440分

class MealsData(BaseModel):
    breakfast: bool = False
    lunch: bool = False
    dinner: bool = False

class HealthCheckCreate(BaseModel):
    condition: ConditionEnum
    sleep_hours: float = Field(..., ge=0, le=24)
    sleep_quality: int = Field(..., ge=1, le=5)
    stress_level: StressLevelEnum
    exercise: ExerciseData
    mood: Optional[List[str]] = []
    meals: Optional[MealsData] = None
    water_intake: Optional[int] = Field(None, ge=0, le=20)
    note: Optional[str] = Field(None, max_length=1000)
    recorded_at: Optional[datetime] = None
    
    @validator('recorded_at', pre=True, always=True)
    def set_recorded_at(cls, v):
        return v or datetime.utcnow()

class HealthCheckResponse(BaseModel):
    id: UUID
    user_id: UUID
    condition: str
    sleep_hours: float
    sleep_quality: int
    stress_level: str
    exercise_done: bool
    exercise_type: Optional[str]
    exercise_duration: Optional[int]
    mood: List[str]
    meals: Dict
    water_intake: Optional[int]
    note: Optional[str]
    recorded_at: datetime
    created_at: datetime
    quick_insight: Optional[str] = None
    
    class Config:
        orm_mode = True
```

## API エンドポイント

### 1. 体調記録エンドポイント
```python
# app/api/v1/endpoints/health_check.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, timedelta
from uuid import UUID

from app.api.dependencies import get_current_user, get_db
from app.schemas.health_check import HealthCheckCreate, HealthCheckResponse
from app.services.health_tracking import HealthTrackingService
from app.models.user import User

router = APIRouter(prefix="/health", tags=["health"])

@router.post("/check", response_model=HealthCheckResponse)
async def create_health_check(
    data: HealthCheckCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """新規体調記録を作成"""
    service = HealthTrackingService(db)
    health_check = await service.create_health_check(
        user_id=current_user.id,
        data=data
    )
    
    # 簡易インサイト生成
    quick_insight = await service.generate_quick_insight(health_check)
    health_check.quick_insight = quick_insight
    
    return health_check

@router.get("/check", response_model=List[HealthCheckResponse])
async def get_health_checks(
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """体調記録を取得"""
    service = HealthTrackingService(db)
    return await service.get_health_checks(
        user_id=current_user.id,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
        offset=offset
    )

@router.put("/check/{check_id}", response_model=HealthCheckResponse)
async def update_health_check(
    check_id: UUID,
    data: HealthCheckCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """体調記録を更新"""
    service = HealthTrackingService(db)
    return await service.update_health_check(
        check_id=check_id,
        user_id=current_user.id,
        data=data
    )

@router.delete("/check/{check_id}")
async def delete_health_check(
    check_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """体調記録を削除"""
    service = HealthTrackingService(db)
    await service.delete_health_check(check_id, current_user.id)
    return {"message": "削除しました"}
```

### 2. 分析・インサイトエンドポイント
```python
# app/api/v1/endpoints/insights.py
from fastapi import APIRouter, Depends, Query, BackgroundTasks
from app.schemas.insight import InsightResponse, AnalysisRequest
from app.services.health_analysis import HealthAnalysisService
from app.services.ai_integration import AIIntegrationService

router = APIRouter(prefix="/health/insights", tags=["insights"])

@router.get("/", response_model=InsightResponse)
async def get_insights(
    period: str = Query("weekly", regex="^(daily|weekly|monthly)$"),
    force_refresh: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """AI分析結果を取得"""
    analysis_service = HealthAnalysisService(db)
    
    # キャッシュチェック
    if not force_refresh:
        cached = await analysis_service.get_cached_insights(
            user_id=current_user.id,
            period=period
        )
        if cached:
            return cached
    
    # 新規生成
    health_data = await analysis_service.get_analysis_data(
        user_id=current_user.id,
        period=period
    )
    
    ai_service = AIIntegrationService()
    insights = await ai_service.generate_insights(health_data)
    
    # 保存とキャッシュ
    await analysis_service.save_insights(current_user.id, insights)
    
    return insights

@router.post("/analyze")
async def analyze_health_data(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """オンデマンド分析をリクエスト"""
    analysis_service = HealthAnalysisService(db)
    
    # バックグラウンドで分析実行
    background_tasks.add_task(
        analysis_service.run_deep_analysis,
        user_id=current_user.id,
        date_range=request.date_range,
        focus_areas=request.focus_areas
    )
    
    return {
        "message": "分析を開始しました",
        "estimated_time": "2-3分"
    }
```

## サービス層

### 1. HealthTrackingService
```python
# app/services/health_tracking.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID

from app.models.health_check import HealthCheck
from app.schemas.health_check import HealthCheckCreate
import numpy as np

class HealthTrackingService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_health_check(
        self, 
        user_id: UUID, 
        data: HealthCheckCreate
    ) -> HealthCheck:
        """体調記録を作成"""
        # 重複チェック
        today = datetime.utcnow().date()
        existing = await self.db.execute(
            select(HealthCheck).where(
                and_(
                    HealthCheck.user_id == user_id,
                    HealthCheck.recorded_at >= today,
                    HealthCheck.recorded_at < today + timedelta(days=1)
                )
            )
        )
        
        if existing.scalar_one_or_none():
            raise ValueError("今日の記録は既に存在します")
        
        # 新規作成
        health_check = HealthCheck(
            user_id=user_id,
            condition=data.condition,
            sleep_hours=data.sleep_hours,
            sleep_quality=data.sleep_quality,
            stress_level=data.stress_level,
            exercise_done=data.exercise.done,
            exercise_type=data.exercise.type,
            exercise_duration=data.exercise.duration,
            mood=data.mood,
            meals=data.meals.dict() if data.meals else {},
            water_intake=data.water_intake,
            note=data.note,
            recorded_at=data.recorded_at
        )
        
        self.db.add(health_check)
        await self.db.commit()
        await self.db.refresh(health_check)
        
        return health_check
    
    async def get_health_checks(
        self,
        user_id: UUID,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[HealthCheck]:
        """体調記録を取得"""
        query = select(HealthCheck).where(
            HealthCheck.user_id == user_id
        )
        
        if from_date:
            query = query.where(HealthCheck.recorded_at >= from_date)
        if to_date:
            query = query.where(HealthCheck.recorded_at <= to_date)
        
        query = query.order_by(desc(HealthCheck.recorded_at))
        query = query.limit(limit).offset(offset)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def generate_quick_insight(self, health_check: HealthCheck) -> str:
        """簡易インサイト生成"""
        insights = []
        
        # 体調評価
        if health_check.condition in ['excellent', 'good']:
            insights.append("素晴らしい体調です！")
        elif health_check.condition in ['poor', 'bad']:
            insights.append("体調に注意が必要です。")
        
        # 睡眠評価
        if health_check.sleep_hours < 6:
            insights.append("睡眠時間が短めです。")
        elif health_check.sleep_hours > 9:
            insights.append("十分な睡眠が取れています。")
        
        # ストレス評価
        if health_check.stress_level == 'high':
            insights.append("ストレス管理を心がけましょう。")
        
        # 運動評価
        if health_check.exercise_done:
            insights.append("運動習慣が維持できています！")
        
        return " ".join(insights) if insights else "今日も一日お疲れ様でした。"
    
    async def calculate_statistics(
        self,
        user_id: UUID,
        period_days: int = 7
    ) -> dict:
        """統計情報を計算"""
        from_date = datetime.utcnow() - timedelta(days=period_days)
        health_checks = await self.get_health_checks(
            user_id=user_id,
            from_date=from_date
        )
        
        if not health_checks:
            return {}
        
        # 各指標のスコア変換
        condition_scores = {
            'excellent': 5, 'good': 4, 'normal': 3, 'poor': 2, 'bad': 1
        }
        stress_scores = {
            'low': 1, 'medium': 2, 'high': 3
        }
        
        conditions = [condition_scores.get(hc.condition, 3) for hc in health_checks]
        sleep_hours = [hc.sleep_hours for hc in health_checks]
        sleep_quality = [hc.sleep_quality for hc in health_checks]
        stress_levels = [stress_scores.get(hc.stress_level, 2) for hc in health_checks]
        exercise_count = sum(1 for hc in health_checks if hc.exercise_done)
        
        return {
            "average_condition": np.mean(conditions),
            "average_sleep_hours": np.mean(sleep_hours),
            "average_sleep_quality": np.mean(sleep_quality),
            "average_stress": np.mean(stress_levels),
            "exercise_rate": (exercise_count / len(health_checks)) * 100,
            "total_records": len(health_checks),
            "period_days": period_days
        }
```

### 2. AIIntegrationService
```python
# app/services/ai_integration.py
import openai
from typing import List, Dict, Any
import json
from datetime import datetime
from app.config import settings

class AIIntegrationService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        
    async def generate_insights(self, health_data: List[Dict]) -> Dict:
        """健康データからインサイトを生成"""
        
        # データの前処理
        summary = self._prepare_data_summary(health_data)
        
        # プロンプト生成
        prompt = f"""
        以下の健康データを分析し、日本語でインサイトを提供してください：
        
        データサマリー:
        {json.dumps(summary, ensure_ascii=False, indent=2)}
        
        以下の形式でJSONを返してください：
        {{
            "overall_trend": "improving/stable/declining",
            "key_patterns": [
                {{"pattern": "パターンの説明", "confidence": 0.8}}
            ],
            "recommendations": [
                {{
                    "category": "sleep/exercise/stress/routine",
                    "priority": "high/medium/low",
                    "title": "推奨事項のタイトル",
                    "description": "詳細な説明",
                    "action_items": ["具体的なアクション"]
                }}
            ],
            "alerts": [
                {{"type": "warning/info", "message": "アラートメッセージ"}}
            ],
            "summary": "全体的なサマリー（100文字以内）",
            "advice": "パーソナライズされたアドバイス（200文字以内）"
        }}
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "あなたは健康管理の専門家です。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"AI生成エラー: {e}")
            return self._generate_fallback_insights(summary)
    
    def _prepare_data_summary(self, health_data: List[Dict]) -> Dict:
        """データをAI分析用にサマライズ"""
        if not health_data:
            return {}
        
        # 統計計算
        conditions = [d.get('condition') for d in health_data]
        sleep_hours = [d.get('sleep_hours', 0) for d in health_data]
        stress_levels = [d.get('stress_level') for d in health_data]
        
        return {
            "期間": f"{len(health_data)}日分",
            "体調分布": dict(zip(*np.unique(conditions, return_counts=True))),
            "平均睡眠時間": np.mean(sleep_hours),
            "ストレス頻度": dict(zip(*np.unique(stress_levels, return_counts=True))),
            "運動実施率": sum(1 for d in health_data if d.get('exercise_done')) / len(health_data) * 100
        }
    
    def _generate_fallback_insights(self, summary: Dict) -> Dict:
        """フォールバック用の基本インサイト生成"""
        return {
            "overall_trend": "stable",
            "key_patterns": [
                {"pattern": "データ不足のため詳細な分析はできません", "confidence": 0.3}
            ],
            "recommendations": [
                {
                    "category": "routine",
                    "priority": "medium",
                    "title": "継続的な記録",
                    "description": "毎日の記録を続けることで、より正確な分析が可能になります",
                    "action_items": ["毎日同じ時間に記録する"]
                }
            ],
            "alerts": [],
            "summary": "データを蓄積中です",
            "advice": "継続的な記録により、パーソナライズされたアドバイスが提供できます"
        }
    
    async def generate_personalized_plan(
        self,
        health_profile: Dict,
        learning_profile: Dict
    ) -> Dict:
        """健康状態と学習プロファイルから個人化プランを生成"""
        
        prompt = f"""
        以下のプロファイルを基に、最適な学習スケジュールを提案してください：
        
        健康プロファイル:
        - 平均睡眠時間: {health_profile.get('average_sleep_hours')}
        - ストレスレベル: {health_profile.get('average_stress')}
        - 運動習慣: {health_profile.get('exercise_rate')}%
        
        学習プロファイル:
        - 学習スタイル: {learning_profile.get('learning_style')}
        - 集中力パターン: {learning_profile.get('concentration_pattern')}
        
        最適な学習時間帯、セッション長、休憩パターンを提案してください。
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "学習効率化の専門家として回答してください"},
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            "personalized_schedule": response.choices[0].message.content,
            "generated_at": datetime.utcnow().isoformat()
        }
```

### 3. パターン検出サービス
```python
# app/services/pattern_detection.py
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta

class PatternDetectionService:
    def __init__(self):
        self.scaler = StandardScaler()
        
    async def detect_patterns(self, health_data: List[Dict]) -> List[Dict]:
        """健康データからパターンを検出"""
        
        if len(health_data) < 7:
            return []
        
        # DataFrameに変換
        df = pd.DataFrame(health_data)
        
        patterns = []
        
        # 1. 曜日パターン検出
        weekday_pattern = self._detect_weekday_pattern(df)
        if weekday_pattern:
            patterns.append(weekday_pattern)
        
        # 2. 睡眠-体調相関
        sleep_correlation = self._analyze_sleep_condition_correlation(df)
        if sleep_correlation:
            patterns.append(sleep_correlation)
        
        # 3. ストレス周期
        stress_cycle = self._detect_stress_cycle(df)
        if stress_cycle:
            patterns.append(stress_cycle)
        
        # 4. 運動効果
        exercise_impact = self._analyze_exercise_impact(df)
        if exercise_impact:
            patterns.append(exercise_impact)
        
        return patterns
    
    def _detect_weekday_pattern(self, df: pd.DataFrame) -> Dict:
        """曜日ごとのパターンを検出"""
        df['weekday'] = pd.to_datetime(df['recorded_at']).dt.dayofweek
        
        # 曜日ごとの平均体調スコア
        condition_map = {'excellent': 5, 'good': 4, 'normal': 3, 'poor': 2, 'bad': 1}
        df['condition_score'] = df['condition'].map(condition_map)
        
        weekday_avg = df.groupby('weekday')['condition_score'].mean()
        
        # 最も体調が悪い曜日
        worst_day = weekday_avg.idxmin()
        best_day = weekday_avg.idxmax()
        
        if weekday_avg[worst_day] < 3 and weekday_avg[best_day] > 3.5:
            weekdays = ['月', '火', '水', '木', '金', '土', '日']
            return {
                "type": "weekday_pattern",
                "description": f"{weekdays[worst_day]}曜日に体調が低下する傾向があります",
                "confidence": 0.7,
                "recommendation": f"{weekdays[worst_day]}曜日は軽めのスケジュールを心がけましょう"
            }
        
        return None
    
    def _analyze_sleep_condition_correlation(self, df: pd.DataFrame) -> Dict:
        """睡眠と体調の相関を分析"""
        condition_map = {'excellent': 5, 'good': 4, 'normal': 3, 'poor': 2, 'bad': 1}
        df['condition_score'] = df['condition'].map(condition_map)
        
        correlation = df['sleep_hours'].corr(df['condition_score'])
        
        if abs(correlation) > 0.5:
            if correlation > 0:
                return {
                    "type": "sleep_correlation",
                    "description": "睡眠時間が長いほど体調が良い傾向があります",
                    "confidence": abs(correlation),
                    "recommendation": "7-8時間の睡眠を確保しましょう"
                }
            else:
                return {
                    "type": "sleep_correlation",
                    "description": "睡眠時間と体調に逆相関が見られます",
                    "confidence": abs(correlation),
                    "recommendation": "睡眠の質を改善することに注力しましょう"
                }
        
        return None
    
    def _detect_stress_cycle(self, df: pd.DataFrame) -> Dict:
        """ストレスの周期性を検出"""
        stress_map = {'low': 1, 'medium': 2, 'high': 3}
        df['stress_score'] = df['stress_level'].map(stress_map)
        
        # 移動平均でトレンド除去
        df['stress_detrended'] = df['stress_score'] - df['stress_score'].rolling(window=7, min_periods=1).mean()
        
        # 簡易的な周期検出
        high_stress_days = df[df['stress_score'] == 3]['recorded_at'].tolist()
        
        if len(high_stress_days) >= 3:
            intervals = []
            for i in range(1, len(high_stress_days)):
                interval = (high_stress_days[i] - high_stress_days[i-1]).days
                intervals.append(interval)
            
            if intervals and np.std(intervals) < 2:
                avg_interval = np.mean(intervals)
                return {
                    "type": "stress_cycle",
                    "description": f"約{int(avg_interval)}日周期でストレスが高まる傾向があります",
                    "confidence": 0.6,
                    "recommendation": "ストレスが高まる時期を予測して対策を立てましょう"
                }
        
        return None
    
    def _analyze_exercise_impact(self, df: pd.DataFrame) -> Dict:
        """運動の影響を分析"""
        condition_map = {'excellent': 5, 'good': 4, 'normal': 3, 'poor': 2, 'bad': 1}
        df['condition_score'] = df['condition'].map(condition_map)
        
        # 運動した日としなかった日の比較
        exercise_days = df[df['exercise_done'] == True]['condition_score'].mean()
        no_exercise_days = df[df['exercise_done'] == False]['condition_score'].mean()
        
        if len(df[df['exercise_done'] == True]) > 3 and len(df[df['exercise_done'] == False]) > 3:
            difference = exercise_days - no_exercise_days
            
            if difference > 0.5:
                return {
                    "type": "exercise_impact",
                    "description": "運動した日は体調が明らかに良い傾向があります",
                    "confidence": min(difference / 2, 0.9),
                    "recommendation": "週3回以上の運動習慣を維持しましょう"
                }
            elif difference < -0.3:
                return {
                    "type": "exercise_impact",
                    "description": "運動後に疲労が残っている可能性があります",
                    "confidence": abs(difference),
                    "recommendation": "運動強度を調整し、回復時間を確保しましょう"
                }
        
        return None
```

## FastAPIメインアプリケーション

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import health_check, insights, reports
from app.config import settings
from app.database import engine, Base

app = FastAPI(
    title="Health Tracking API",
    description="体調管理とAI分析API",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(health_check.router, prefix="/api/v1")
app.include_router(insights.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")

@app.on_event("startup")
async def startup():
    """起動時処理"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}
```

## 環境設定

### requirements.txt
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
asyncpg==0.29.0
alembic==1.12.1
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
openai==1.3.0
pandas==2.1.3
numpy==1.24.3
scikit-learn==1.3.2
redis==5.0.1
celery==5.3.4
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
```

### Docker構成
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/health_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./app:/app

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=health_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## セキュリティ考慮事項

1. **認証・認可**
   - JWT トークンベース認証
   - ユーザーごとのデータアクセス制御
   - APIレート制限

2. **データ保護**
   - HTTPS通信必須
   - 機密データの暗号化
   - SQLインジェクション対策

3. **プライバシー**
   - 個人情報の最小限収集
   - データ削除権の実装
   - 匿名化オプション

## デプロイメント

### 本番環境推奨構成
- **API**: AWS ECS / Google Cloud Run
- **DB**: AWS RDS PostgreSQL / Cloud SQL
- **キャッシュ**: ElastiCache Redis
- **AI**: OpenAI API / Anthropic Claude API
- **モニタリング**: Datadog / New Relic
- **ログ**: CloudWatch / Stackdriver