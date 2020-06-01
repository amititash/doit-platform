import React from 'react'
import { useTranslation } from 'react-i18next'

const Hello = () => {
  const { t } = useTranslation();

  return (
    <div className="container py-md-5 card mt-5 mb-6 border-0 mainform">
      <div className="row card-body mb-5">
        <div className="col-12 row">

          <div className="col-4" >
            <div className="card border-0 h-100 shadow">
              <div className="card-body text-center px-0">
                <h2 className="col-12 card-title">{t('hello.label')}</h2>
                <img src="https://loremflickr.com/300/400" />
                <div>

                </div>
              </div>
            </div>
          </div>

          <div className="col-4" >
            <div className="card border-0 h-100 shadow">
              <div className="card-body text-center px-0">
                <h2 className="col-12 ">{t('hello.label')}</h2>
                <img src="https://loremflickr.com/300/400" />
              </div>
            </div>
          </div>

          <div className="col-4" >
            <div className="card border-0 h-100 shadow">
              <div className="card-body text-center px-0">
                <h2 className="col-12 ">{t('hello.label')}</h2>
                <img src="https://loremflickr.com/300/400" />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
   
  )
}

export default Hello