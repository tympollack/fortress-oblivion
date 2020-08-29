module.exports = {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },

  firebase: {
    projectId: {
      doc: 'ID of the project.',
      format: String,
      default: 'fortress-oblivion'
    },
  },

  url: {
    base: {
      doc: 'Base URL for HATEOAS.',
      format: String,
      default: 'https://fortress-oblivion.web.app'
    },

    apiPath: {
      doc: 'Future-proofing.',
      format: String,
      default: '/api'
    },
  },

  datastore: {
    buckets: {
      fsBackups: {
        name: {
          format: 'guid',
          default: ''
        },

        collectionIds: {
          format: Array,
          default: ['']
        }
      },
    }
  },

  firestore: {
    collections: {
      users: {
        name: {
          format: String,
          default: 'users'
        },

        id: {
          name: {
            format: String,
            default: 'id'
          },
          path: {
            format: String,
            default: 'users/{id}'
          }
        },

        fields: {
          chest: {
            doc: 'gold to be discovered',
            name: {
              format: String,
              default: 'chest'
            },
            path: {
              format: String,
              default: 'users/{chest}'
            }
          },

          equipment: {
            doc: 'array of player items held',
            name: {
              format: String,
              default: 'equipment'
            },
            path: {
              format: String,
              default: 'users/{equipment}'
            },
            quantity: {
              doc: '# items',
              name: {
                format: String,
                default: 'quantity'
              },
              path: {
                format: String,
                default: 'users/equipment/{quantity}'
              }
            },
            type: {
              doc: 'type of item',
              name: {
                format: String,
                default: 'type'
              },
              path: {
                format: String,
                default: 'users/equipment/{type}'
              }
            },
          },

          gold: {
            doc: 'gold amount',
            name: {
              format: String,
              default: 'gold'
            },
            path: {
              format: String,
              default: 'users/{gold}'
            }
          },

          id: {
            doc: 'ties to firebase id',
            name: {
              format: String,
              default: 'id'
            },
            path: {
              format: String,
              default: 'users/{id}'
            }
          },

          hasKey: {
            doc: 'whether key is in hand',
            name: {
              format: String,
              default: 'hasKey'
            },
            path: {
              format: String,
              default: 'users/{hasKey}'
            }
          },

          health: {
            doc: 'current health',
            name: {
              format: String,
              default: 'health'
            },
            path: {
              format: String,
              default: 'users/{health}'
            }
          },

          level: {
            doc: 'current level of tower. uses string in case we wanted special cases ever',
            name: {
              format: String,
              default: 'level'
            },
            path: {
              format: String,
              default: 'users/{level}'
            }
          },

          location: {
            doc: 'current world location',
            name: {
              format: String,
              default: 'location'
            },
            path: {
              format: String,
              default: 'users/{location}'
            }
          },

          maxHealth: {
            doc: 'max health',
            name: {
              format: String,
              default: 'maxHealth'
            },
            path: {
              format: String,
              default: 'users/{maxHealth}'
            }
          },

          options: {
            doc: 'array of available player options',
            name: {
              format: String,
              default: 'options'
            },
            path: {
              format: String,
              default: 'users/{options}'
            },
            apiPath: {
              doc: 'api path of option',
              name: {
                format: String,
                default: 'apiPath'
              },
              path: {
                format: String,
                default: 'users/options/{apiPath}'
              }
            },
            description: {
              doc: 'text description of option',
              name: {
                format: String,
                default: 'description'
              },
              path: {
                format: String,
                default: 'users/options/{description}'
              }
            },
          },

          optionsTitle: {
            doc: 'title of options list',
            name: {
              format: String,
              default: 'optionsTitle'
            },
            path: {
              format: String,
              default: 'users/{optionsTitle}'
            }
          },

          potion: {
            doc: 'potion hp amount',
            name: {
              format: Number,
              default: 'potion'
            },
            path: {
              format: String,
              default: 'users/{potion}'
            }
          },

          status: {
            doc: 'status',
            name: {
              format: String,
              default: 'status'
            },
            path: {
              format: String,
              default: 'users/{status}'
            },
          },

          timerLength: {
            doc: 'amount of time in seconds for timer',
            name: {
              format: String,
              default: 'timerLength'
            },
            path: {
              format: String,
              default: 'users/{timerLength}'
            }
          },

          timerStart: {
            doc: 'time last timed action started',
            name: {
              format: String,
              default: 'timerStart'
            },
            path: {
              format: String,
              default: 'users/{timerStart}'
            }
          },

          username: {
            doc: 'sr username',
            name: {
              format: String,
              default: 'username'
            },
            path: {
              format: String,
              default: 'users/{username}'
            }
          },
        }
      },
    },
  },

  pubsub: {

    topics: {
      doc: 'Topics added to by cron -> app engine.',

      backupFirestore: {
        format: String,
        default: 'backup-firestore'
      },
    }
  },
}