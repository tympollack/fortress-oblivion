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

          created: {
            doc: 'time user created',
            name: {
              format: String,
              default: 'created'
            },
            path: {
              format: String,
              default: 'users/{created}'
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

          fightingSince: {
            doc: 'time started fight',
            name: {
              format: String,
              default: 'fightingSince'
            },
            path: {
              format: String,
              default: 'users/{fightingSince}'
            }
          },

          encounterId: {
            doc: 'current encounter id',
            name: {
              format: String,
              default: 'encounterId'
            },
            path: {
              format: String,
              default: 'users/{encounterId}'
            }
          },

          encounterResult: {
            doc: 'current encounter result',
            name: {
              format: String,
              default: 'encounterResult'
            },
            path: {
              format: String,
              default: 'users/{encounterResult}'
            }
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

          isAdmin: {
            doc: 'is user game admin',
            name: {
              format: String,
              default: 'isAdmin'
            },
            path: {
              format: String,
              default: 'users/{isAdmin}'
            }
          },

          isGod: {
            doc: 'is user app admin',
            name: {
              format: String,
              default: 'isGod'
            },
            path: {
              format: String,
              default: 'users/{isGod}'
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

          numEncounters: {
            doc: 'amount of encounters',
            name: {
              format: String,
              default: 'numEncounters'
            },
            path: {
              format: String,
              default: 'users/{numEncounters}'
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
            heading: {
              doc: 'option heading',
              name: {
                format: String,
                default: 'heading'
              },
              path: {
                format: String,
                default: 'users/options/{heading}'
              }
            },
            subheading: {
              doc: 'option subheading',
              name: {
                format: String,
                default: 'subheading'
              },
              path: {
                format: String,
                default: 'users/options/{subheading}'
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
              format: String,
              default: 'potion'
            },
            path: {
              format: String,
              default: 'users/{potion}'
            }
          },

          queuedSince: {
            doc: 'time entered queue',
            name: {
              format: String,
              default: 'queuedSince'
            },
            path: {
              format: String,
              default: 'users/{queuedSince}'
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

          substatus: {
            doc: 'substatus',
            name: {
              format: String,
              default: 'substatus'
            },
            path: {
              format: String,
              default: 'users/{substatus}'
            }
          },

          timerEnd: {
            doc: 'time for timed action end',
            name: {
              format: String,
              default: 'timerEnd'
            },
            path: {
              format: String,
              default: 'users/{timerEnd}'
            }
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

      world: {
        name: {
          format: String,
          default: 'world'
        },

        id: {
          name: {
            format: String,
            default: 'id'
          },
          path: {
            format: String,
            default: 'world/{id}'
          }
        },

        reserved: {
          state: {
            format: String,
            default: 'state'
          }
        },

        fields: {
          numQueued: {
            doc: 'number of players seeking encounter in the fortress',
            name: {
              format: String,
              default: 'numQueued'
            },
            path: {
              format: String,
              default: 'world/{numQueued}'
            }
          },
        }
      },

      queue: {
        name: {
          format: String,
          default: 'queue'
        },

        id: {
          name: {
            format: String,
            default: 'id'
          },
          path: {
            format: String,
            default: 'queue/{id}'
          }
        },

        fields: {
        }
      },

      encounters: {
        name: {
          format: String,
          default: 'encounters'
        },

        id: {
          name: {
            format: String,
            default: 'id'
          },
          path: {
            format: String,
            default: 'encounters/{id}'
          }
        },

        fields: {
          end: {
            doc: 'end',
            name: {
              format: String,
              default: 'end'
            },
            path: {
              format: String,
              default: 'encounters/{end}'
            }
          },

          format: {
            doc: 'format',
            name: {
              format: String,
              default: 'format'
            },
            path: {
              format: String,
              default: 'encounters/{format}'
            }
          },

          loser: {
            doc: 'loser id',
            name: {
              format: String,
              default: 'loser'
            },
            path: {
              format: String,
              default: 'encounters/{loser}'
            }
          },

          playPace: {
            doc: 'pace of play option',
            name: {
              format: String,
              default: 'playPace'
            },
            path: {
              format: String,
              default: 'encounters/{playPace}'
            }
          },

          player1Id: {
            doc: 'player1 id',
            name: {
              format: String,
              default: 'player1Id'
            },
            path: {
              format: String,
              default: 'encounters/{player1Id}'
            }
          },

          player1: {
            doc: 'player1',
            name: {
              format: String,
              default: 'player1'
            },
            path: {
              format: String,
              default: 'encounters/{player1}'
            }
          },

          player2Id: {
            doc: 'player2 id',
            name: {
              format: String,
              default: 'player2Id'
            },
            path: {
              format: String,
              default: 'encounters/{player2Id}'
            }
          },

          player2: {
            doc: 'player2',
            name: {
              format: String,
              default: 'player2'
            },
            path: {
              format: String,
              default: 'encounters/{player2}'
            }
          },

          result: {
            doc: 'result',
            name: {
              format: String,
              default: 'result'
            },
            path: {
              format: String,
              default: 'encounters/{result}'
            }
          },

          resultConfirmed: {
            doc: 'result confirmed by opponent',
            name: {
              format: String,
              default: 'resultConfirmed'
            },
            path: {
              format: String,
              default: 'encounters/{resultConfirmed}'
            }
          },

          resultDisputed: {
            doc: 'result disputed by opponent',
            name: {
              format: String,
              default: 'resultDisputed'
            },
            path: {
              format: String,
              default: 'encounters/{resultDisputed}'
            }
          },

          start: {
            doc: 'start time',
            name: {
              format: String,
              default: 'start'
            },
            path: {
              format: String,
              default: 'encounters/{start}'
            }
          },

          winner: {
            doc: 'winner id',
            name: {
              format: String,
              default: 'winner'
            },
            path: {
              format: String,
              default: 'encounters/{winner}'
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