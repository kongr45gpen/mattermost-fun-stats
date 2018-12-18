import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Statistics from '../components/statistics'

import NumberFormat from 'react-number-format';

import serviceIcon1 from '../images/service-icon-1.png'
import serviceIcon3 from '../images/service-icon-3.png'
import raccoon from '../images/raccoon.svg'

const IndexPage = () => (
  <Layout>
    <h1>Mattermost Statistics</h1>

      <Statistics/>

      <footer className="footer-area relative sky-bg" id="contact-page">
          <div className="absolute footer-bg"></div>
          <div className="footer-bottom">
              <div className="container">
                  <div className="row">
                      <div className="col-xs-12 text-center">
                          <p>Mattermost instance statistics. Designed by
                              Quomodotheme. Raccoon icon from <a href="https://www.iconfinder.com/icons/3406424/animal_furry_pet_raccoon_wildlife_zoo_icon">Chanut is</a>.</p>
                      </div>
                  </div>
              </div>
          </div>
      </footer>
  </Layout>
)

export default IndexPage
