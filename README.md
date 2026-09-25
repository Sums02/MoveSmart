
# MoveSmart

MoveSmart is a machine learning-powered property valuation and affordability platform that helps users to better understand the UK housing market. By combining machine learning forecasts, affordability analysis and interactive market insights, this platform enables users to make more informed home-buying decisions.
---



## Folder Structure

```
MoveSmart/
├── backend/                    # FastAPI backend 
│   ├── app/
│   │   ├── main.py             
│   │   ├── models.py           
│   │   ├── routes/             
│   │   └── utils.py            
│   ├── database/
│   │   └── db.py               # PostgreSQL connection (Section 2.3)
│   ├── requirements.txt        
│   └── .env.example            
│
|                
├──src/                        # React frontend 
│   │         
│                       
│               
│
├── models/                     # Trained ML models 
│   ├── xgboost_model.pkl
│   ├── lasso_model.pkl
│   └── scaler.pkl
│
├── data/
│   ├── processed_data.csv      # Final dataset used in models 
│   └── raw/                    # Source CSVs (UKHPI, CPIH, rates)
│
├── notebooks/                  # Jupyter notebooks for models devlopment (Section 2.1)
│   ├── 01_data_cleaning.ipynb
│   ├── 02_feature_engineering.ipynb
│   └── 03_model_training.ipynb




